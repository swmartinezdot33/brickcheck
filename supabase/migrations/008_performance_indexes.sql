-- Add performance indexes for faster set detail queries
-- This migration creates indexes to optimize common queries

-- Index for price_snapshots queries (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_price_snapshots_set_timestamp 
ON price_snapshots(set_id, timestamp DESC);

-- Index for filtering by condition
CREATE INDEX IF NOT EXISTS idx_price_snapshots_condition 
ON price_snapshots(set_id, condition);

-- Index for set lookups by set_number
CREATE INDEX IF NOT EXISTS idx_sets_set_number 
ON sets(set_number);

-- Index for collection items queries
CREATE INDEX IF NOT EXISTS idx_collection_items_user_collection 
ON collection_items(user_id, collection_id);

-- Composite index for common set queries
CREATE INDEX IF NOT EXISTS idx_sets_theme_year 
ON sets(theme, year DESC);

-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_collection_items_set_id 
ON collection_items(set_id);

-- Add comment explaining the indexes
COMMENT ON INDEX idx_price_snapshots_set_timestamp IS 'Optimizes set detail page price snapshot queries';
COMMENT ON INDEX idx_price_snapshots_condition IS 'Optimizes filtering by sealed/used condition';
COMMENT ON INDEX idx_sets_set_number IS 'Optimizes set lookup by set number';
COMMENT ON INDEX idx_collection_items_user_collection IS 'Optimizes collection page queries';
COMMENT ON INDEX idx_sets_theme_year IS 'Optimizes set browsing by theme and year';
COMMENT ON INDEX idx_collection_items_set_id IS 'Optimizes dashboard value calculations';

