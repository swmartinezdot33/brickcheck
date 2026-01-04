-- Enable Row Level Security
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Sets: All authenticated users can read, only service role can write
CREATE POLICY "Sets are viewable by everyone" ON sets
  FOR SELECT USING (true);

CREATE POLICY "Sets are insertable by service role only" ON sets
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Sets are updatable by service role only" ON sets
  FOR UPDATE USING (auth.role() = 'service_role');

-- Set identifiers: All authenticated users can read, only service role can write
CREATE POLICY "Set identifiers are viewable by everyone" ON set_identifiers
  FOR SELECT USING (true);

CREATE POLICY "Set identifiers are insertable by service role only" ON set_identifiers
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- User collection items: Users can only access their own items
CREATE POLICY "Users can view their own collection items" ON user_collection_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collection items" ON user_collection_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collection items" ON user_collection_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collection items" ON user_collection_items
  FOR DELETE USING (auth.uid() = user_id);

-- Price snapshots: All authenticated users can read, only service role can write
CREATE POLICY "Price snapshots are viewable by everyone" ON price_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Price snapshots are insertable by service role only" ON price_snapshots
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Alerts: Users can only access their own alerts
CREATE POLICY "Users can view their own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts" ON alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Alert events: Users can only view events for their alerts
CREATE POLICY "Users can view their own alert events" ON alert_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM alerts
      WHERE alerts.id = alert_events.alert_id
      AND alerts.user_id = auth.uid()
    )
  );

CREATE POLICY "Alert events are insertable by service role only" ON alert_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Audit log: Users can view their own audit logs, service role can insert
CREATE POLICY "Users can view their own audit logs" ON audit_log
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Audit logs are insertable by service role only" ON audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');



