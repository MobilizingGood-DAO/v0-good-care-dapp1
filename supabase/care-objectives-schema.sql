-- Create care_objectives table for community CARE points
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('mentorship', 'content', 'support', 'events')),
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
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

-- Insert sample objectives for testing
INSERT INTO care_objectives (user_id, username, title, description, category, points, status, completed_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice_wellness', 'Onboard 5 New Members', 'Help 5 newcomers complete their first week of check-ins', 'mentorship', 100, 'completed', NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'bob_mindful', 'Create Wellness Guide', 'Write comprehensive guide on daily mindfulness practices', 'content', 75, 'completed', NOW() - INTERVAL '1 day'),
  ('33333333-3333-3333-3333-333333333333', 'charlie_care', 'Weekly Check-in Support', 'Provide encouragement in community check-in threads', 'support', 50, 'completed', NOW() - INTERVAL '3 hours'),
  ('44444444-4444-4444-4444-444444444444', 'diana_zen', 'Community Meditation Session', 'Organize and lead weekly group meditation', 'events', 125, 'completed', NOW() - INTERVAL '1 hour');
