-- Allow public access to display_name for users who have public collections
-- This enables displaying the collection owner's name on shared collection pages

CREATE POLICY "Public can view display_name for users with public collections" 
  ON user_profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.user_id = user_profiles.user_id 
      AND collections.is_public = true
    )
  );

