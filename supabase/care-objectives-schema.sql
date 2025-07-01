-- Create care_objectives table for community CARE points
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  objective_type TEXT NOT NULL, -- 'community_help', 'resource_share', 'mentorship', etc.
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'verified'
  evidence_url TEXT, -- Link to proof/evidence
  verified_by UUID REFERENCES users(id), -- Admin/moderator who verified
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_care_objectives_user_id ON care_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_care_objectives_username ON care_objectives(username);
CREATE INDEX IF NOT EXISTS idx_care_objectives_status ON care_objectives(status);
CREATE INDEX IF NOT EXISTS idx_care_objectives_created_at ON care_objectives(created_at);

-- Create RLS policies
ALTER TABLE care_objectives ENABLE ROW LEVEL SECURITY;

-- Users can view all completed objectives
CREATE POLICY "Users can view completed objectives" ON care_objectives
  FOR SELECT USING (status = 'completed');

-- Users can insert their own objectives
CREATE POLICY "Users can insert own objectives" ON care_objectives
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own pending objectives
CREATE POLICY "Users can update own objectives" ON care_objectives
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_care_objectives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_care_objectives_updated_at
  BEFORE UPDATE ON care_objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_care_objectives_updated_at();

-- Insert some sample data
INSERT INTO care_objectives (user_id, username, wallet_address, objective_type, title, description, points, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'alice_cares', '0x1234...5678', 'community_help', 'Helped newcomer with wallet setup', 'Guided a new user through their first wallet connection and token claim', 50, 'completed'),
  ('550e8400-e29b-41d4-a716-446655440001', 'bob_builder', '0x2345...6789', 'resource_share', 'Shared mental health resources', 'Created and shared a comprehensive guide on mindfulness practices', 75, 'completed'),
  ('550e8400-e29b-41d4-a716-446655440002', 'charlie_mentor', '0x3456...7890', 'mentorship', 'Mentored 3 community members', 'Provided ongoing support and guidance to new community members', 100, 'completed'),
  ('550e8400-e29b-41d4-a716-446655440000', 'alice_cares', '0x1234...5678', 'community_help', 'Organized community wellness event', 'Coordinated a virtual meditation session for 20+ participants', 125, 'completed'),
  ('550e8400-e29b-41d4-a716-446655440001', 'bob_builder', '0x2345...6789', 'resource_share', 'Created educational content', 'Developed video tutorials on blockchain wellness applications', 90, 'completed');
