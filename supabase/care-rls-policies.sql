-- Enable RLS on checkins table if not already enabled
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own check-ins
CREATE POLICY IF NOT EXISTS "Users can view their own check-ins"
ON checkins
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own check-ins
CREATE POLICY IF NOT EXISTS "Users can insert their own check-ins"
ON checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own check-ins
CREATE POLICY IF NOT EXISTS "Users can update their own check-ins"
ON checkins
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
