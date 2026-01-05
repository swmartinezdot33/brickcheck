-- Indexes for performance

-- Sets
CREATE INDEX IF NOT EXISTS idx_sets_set_number ON sets(set_number);
CREATE INDEX IF NOT EXISTS idx_sets_theme ON sets(theme);
CREATE INDEX IF NOT EXISTS idx_sets_year ON sets(year);
CREATE INDEX IF NOT EXISTS idx_sets_retired ON sets(retired);
CREATE INDEX IF NOT EXISTS idx_sets_brickset_id ON sets(brickset_id);
CREATE INDEX IF NOT EXISTS idx_sets_bricklink_id ON sets(bricklink_id);

-- Set identifiers
CREATE INDEX IF NOT EXISTS idx_set_identifiers_set_id ON set_identifiers(set_id);
CREATE INDEX IF NOT EXISTS idx_set_identifiers_value ON set_identifiers(identifier_value);
CREATE INDEX IF NOT EXISTS idx_set_identifiers_type ON set_identifiers(identifier_type);

-- User collection items
CREATE INDEX IF NOT EXISTS idx_user_collection_items_user_id ON user_collection_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_items_set_id ON user_collection_items(set_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_items_condition ON user_collection_items(condition);
CREATE INDEX IF NOT EXISTS idx_user_collection_items_user_set_condition ON user_collection_items(user_id, set_id, condition);

-- Price snapshots
CREATE INDEX IF NOT EXISTS idx_price_snapshots_set_id ON price_snapshots(set_id);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_condition ON price_snapshots(condition);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_timestamp ON price_snapshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_set_condition_timestamp ON price_snapshots(set_id, condition, timestamp DESC);

-- Alerts
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_set_id ON alerts(set_id);
CREATE INDEX IF NOT EXISTS idx_alerts_enabled ON alerts(enabled);
CREATE INDEX IF NOT EXISTS idx_alerts_user_enabled ON alerts(user_id, enabled);

-- Alert events
CREATE INDEX IF NOT EXISTS idx_alert_events_alert_id ON alert_events(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_events_set_id ON alert_events(set_id);
CREATE INDEX IF NOT EXISTS idx_alert_events_triggered_at ON alert_events(triggered_at);

-- Audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_type_id ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);





