ALTER TABLE analyses ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_analyses_user_id ON analyses(user_id);

-- Update RLS policies to be user-specific
DROP POLICY IF EXISTS "select_analyses" ON analyses;
DROP POLICY IF EXISTS "insert_analyses" ON analyses;
DROP POLICY IF EXISTS "update_analyses" ON analyses;
DROP POLICY IF EXISTS "delete_analyses" ON analyses;

CREATE POLICY "select_own_analyses" ON analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "insert_own_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "update_own_analyses" ON analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "delete_own_analyses" ON analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);