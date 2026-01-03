-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Add updated_at trigger for collections
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add collection_id to user_collection_items
ALTER TABLE user_collection_items 
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE CASCADE;

-- Enable RLS on collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Policies for collections
CREATE POLICY "Users can view their own collections" 
  ON collections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections" 
  ON collections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" 
  ON collections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" 
  ON collections FOR DELETE 
  USING (auth.uid() = user_id);

-- Backfill default collection for existing items
DO $$
DECLARE
  user_record RECORD;
  default_collection_id UUID;
BEGIN
  -- For each user who has items but no collections
  FOR user_record IN 
    SELECT DISTINCT user_id FROM user_collection_items 
    WHERE collection_id IS NULL
  LOOP
    -- Create default collection if it doesn't exist
    INSERT INTO collections (user_id, name, description)
    VALUES (user_record.user_id, 'My Collection', 'Default collection')
    ON CONFLICT (user_id, name) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO default_collection_id;

    -- Update items
    UPDATE user_collection_items
    SET collection_id = default_collection_id
    WHERE user_id = user_record.user_id AND collection_id IS NULL;
  END LOOP;
END $$;


