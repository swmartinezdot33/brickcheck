-- Add sharing fields to collections table
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create index on share_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_collections_share_token ON collections(share_token) WHERE share_token IS NOT NULL;

-- Update RLS policies to allow public access to shared collections
-- Allow anyone to view collections that are public
CREATE POLICY "Public can view shared collections" 
  ON collections FOR SELECT 
  USING (is_public = true);

-- Allow public access to view collection items when the parent collection is public
CREATE POLICY "Public can view items in shared collections" 
  ON user_collection_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = user_collection_items.collection_id 
      AND collections.is_public = true
    )
  );

