-- Add complete sets support to sets table
ALTER TABLE sets ADD COLUMN IF NOT EXISTS is_complete_set BOOLEAN DEFAULT false;
ALTER TABLE sets ADD COLUMN IF NOT EXISTS minifigure_count INTEGER;
ALTER TABLE sets ADD COLUMN IF NOT EXISTS set_type TEXT DEFAULT 'STANDARD' CHECK (set_type IN ('STANDARD', 'MINIFIGURE_SERIES', 'COLLECTIBLE'));

-- Add index for querying complete sets
CREATE INDEX IF NOT EXISTS idx_sets_is_complete_set ON sets(is_complete_set);
CREATE INDEX IF NOT EXISTS idx_sets_set_type ON sets(set_type);

-- Add collection_id to user_collection_items (already exists in some versions)
ALTER TABLE user_collection_items ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- Create collections table if it doesn't exist
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Add collection pricing table for multi-source pricing
CREATE TABLE IF NOT EXISTS collection_item_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_item_id UUID NOT NULL REFERENCES user_collection_items(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'BRICKLINK', 'BRICKECONOMY', 'EBAY', 'STOCKX', etc.
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  last_updated TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger for collections
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_collection_item_prices_collection_item_id ON collection_item_prices(collection_item_id);
CREATE INDEX IF NOT EXISTS idx_collection_item_prices_source ON collection_item_prices(source);
CREATE INDEX IF NOT EXISTS idx_user_collection_items_collection_id ON user_collection_items(collection_id);

