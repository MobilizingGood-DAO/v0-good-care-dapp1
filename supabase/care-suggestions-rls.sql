-- Ensure users can only view their own check-ins for CARE suggestions
CREATE POLICY IF NOT EXISTS "Users can view their own check-ins for CARE"
ON checkins
FOR SELECT
USING (auth.uid() = user_id);

-- Also ensure the policy exists for general checkin access
CREATE POLICY IF NOT EXISTS "Users can insert their own check-ins"
ON checkins  
FOR INSERT
WITH CHECK (auth.uid() = user_id);
