-- Phase 1: Database Schema Enhancement for Local Catalog
-- Add fields to support local catalog with data source tracking

-- Add new columns to sets table for local catalog support
ALTER TABLE sets 
ADD COLUMN IF NOT EXISTS data_source TEXT,
ADD COLUMN IF NOT EXISTS last_verified TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS external_urls JSONB DEFAULT '{}'::jsonb;

-- Create enum type for data sources (using CHECK constraint instead of enum for flexibility)
-- We'll use TEXT with CHECK constraint for better compatibility

-- Add index on data_source for faster queries
CREATE INDEX IF NOT EXISTS idx_sets_data_source ON sets(data_source);

-- Add index on last_verified for finding stale data
CREATE INDEX IF NOT EXISTS idx_sets_last_verified ON sets(last_verified);

-- Add index on data_quality_score for finding low-quality records
CREATE INDEX IF NOT EXISTS idx_sets_data_quality_score ON sets(data_quality_score);

-- Add index on GTIN for faster barcode lookups (via set_identifiers)
-- This is already covered in 003_indexes.sql, but ensuring it exists
CREATE INDEX IF NOT EXISTS idx_set_identifiers_gtin_lookup ON set_identifiers(identifier_type, identifier_value) 
WHERE identifier_type IN ('GTIN', 'UPC', 'EAN');

-- Add comment explaining data_source values
COMMENT ON COLUMN sets.data_source IS 'Source of the data: REBRICKABLE, BRICKSET_SCRAPE, BRICKLINK_SCRAPE, LEGO_COM_SCRAPE, API_CACHE, MANUAL, etc.';
COMMENT ON COLUMN sets.last_verified IS 'When this data was last verified/updated from source';
COMMENT ON COLUMN sets.data_quality_score IS 'Completeness score 0-100 based on available fields';
COMMENT ON COLUMN sets.scraped_at IS 'When this data was scraped/imported';
COMMENT ON COLUMN sets.external_urls IS 'JSON object with source URLs: {brickset: "...", bricklink: "...", lego_com: "..."}';

