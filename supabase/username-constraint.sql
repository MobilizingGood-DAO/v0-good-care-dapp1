-- Add unique constraint on username column
ALTER TABLE users 
ADD CONSTRAINT users_username_unique 
UNIQUE (username);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_username 
ON users(username);

-- Update RLS policy to allow users to update their own username
CREATE POLICY "Allow users to update their username"
ON users
FOR UPDATE
USING (id = auth.uid());
