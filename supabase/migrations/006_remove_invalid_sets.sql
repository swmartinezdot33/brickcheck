-- Migration: Remove invalid set numbers that don't match LEGO format
-- LEGO set numbers are typically 4-7 digits without special characters
-- This removes promotional items, variants, and Rebrickable-specific IDs

DELETE FROM sets
WHERE set_number NOT SIMILAR TO '^[0-9]{4,7}$'
AND id IS NOT NULL;

-- Index to improve performance of set lookups by number
CREATE INDEX IF NOT EXISTS idx_sets_set_number_valid 
ON sets(set_number) 
WHERE set_number SIMILAR TO '^[0-9]{4,7}$';

-- Log the action
COMMENT ON TABLE sets IS 'LEGO Sets catalog - filtered to only valid LEGO set numbers (4-7 digits)';


