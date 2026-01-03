-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sets table (canonical LEGO sets)
CREATE TABLE IF NOT EXISTS sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  theme TEXT,
  year INTEGER,
  piece_count INTEGER,
  msrp_cents INTEGER,
  image_url TEXT,
  retired BOOLEAN DEFAULT false,
  brickset_id TEXT,
  bricklink_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set identifiers (GTIN/barcode mapping)
CREATE TABLE IF NOT EXISTS set_identifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
  identifier_type TEXT NOT NULL, -- 'GTIN', 'UPC', 'EAN', etc.
  identifier_value TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL, -- 'BRICKSET', 'MANUAL', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User collection items
CREATE TABLE IF NOT EXISTS user_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  set_id UUID NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
  condition TEXT NOT NULL CHECK (condition IN ('SEALED', 'USED')),
  condition_grade TEXT, -- for used: 'MINT', 'COMPLETE', 'INCOMPLETE'
  quantity INTEGER DEFAULT 1,
  acquisition_cost_cents INTEGER,
  acquisition_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price snapshots (raw price data)
CREATE TABLE IF NOT EXISTS price_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
  condition TEXT NOT NULL CHECK (condition IN ('SEALED', 'USED')),
  source TEXT NOT NULL, -- 'BRICKLINK', etc.
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  timestamp TIMESTAMPTZ NOT NULL,
  sample_size INTEGER,
  variance NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  set_id UUID REFERENCES sets(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('THRESHOLD', 'PERCENT_CHANGE')),
  condition TEXT CHECK (condition IN ('SEALED', 'USED')),
  threshold_cents INTEGER,
  percent_change NUMERIC,
  window_days INTEGER NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('ABOVE', 'BELOW', 'EITHER')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert events (triggered alerts)
CREATE TABLE IF NOT EXISTS alert_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  set_id UUID NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL,
  price_cents INTEGER NOT NULL,
  previous_price_cents INTEGER,
  percent_change NUMERIC,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log (optional, for debugging)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_sets_updated_at BEFORE UPDATE ON sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collection_items_updated_at BEFORE UPDATE ON user_collection_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

