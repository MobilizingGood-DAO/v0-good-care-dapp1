-- Create care_objectives table
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('mentorship', 'content', 'support', 'events')),
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_care_objectives_user_id ON care_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_care_objectives_username ON care_objectives(username);
CREATE INDEX IF NOT EXISTS idx_care_objectives_status ON care_objectives(status);
CREATE INDEX IF NOT EXISTS idx_care_objectives_category ON care_objectives(category);

-- Enable RLS
ALTER TABLE care_objectives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all objectives" ON care_objectives
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own objectives" ON care_objectives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives" ON care_objectives
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample objectives
INSERT INTO care_objectives (user_id, username, title, description, category, points, status) VALUES
  (gen_random_uuid(), 'alice_care', 'Onboard 5 New Members', 'Help 5 newcomers set up their GOOD Passport and complete their first check-in', 'mentorship', 100, 'completed'),
  (gen_random_uuid(), 'bob_wellness', 'Create Wellness Guide', 'Write a comprehensive guide on daily wellness practices for the community', 'content', 75, 'completed'),
  (gen_random_uuid(), 'charlie_support', 'Weekly Check-in Support', 'Provide encouragement and support in daily check-in threads for one week', 'support', 50, 'completed'),
  (gen_random_uuid(), 'diana_events', 'Community Meditation Session', 'Organize and lead a virtual meditation session for the community', 'events', 125, 'completed'),
  (gen_random_uuid(), 'eve_mentor', 'Peer Mentorship Program', 'Mentor 3 community members through their first month of GOOD CARE', 'mentorship', 100, 'pending'),
  (gen_random_uuid(), 'frank_content', 'Video Tutorial Series', 'Create 5 video tutorials on using GOOD CARE features', 'content', 75, 'pending');
