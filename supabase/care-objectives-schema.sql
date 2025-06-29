-- Create care_objectives table for community CARE points
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('mentorship', 'content', 'support', 'events')),
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE care_objectives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all objectives" ON care_objectives
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own objectives" ON care_objectives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives" ON care_objectives
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_care_objectives_user_id ON care_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_care_objectives_status ON care_objectives(status);
CREATE INDEX IF NOT EXISTS idx_care_objectives_category ON care_objectives(category);

-- Insert sample objectives
INSERT INTO care_objectives (user_id, username, title, description, category, points, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'alice_care', 'Onboard 5 New Members', 'Help newcomers get started with GOOD CARE', 'mentorship', 100, 'active'),
  ('00000000-0000-0000-0000-000000000002', 'bob_wellness', 'Create Wellness Guide', 'Write comprehensive wellness resource', 'content', 75, 'completed'),
  ('00000000-0000-0000-0000-000000000003', 'charlie_support', 'Weekly Check-in Support', 'Provide daily encouragement to community', 'support', 50, 'active'),
  ('00000000-0000-0000-0000-000000000004', 'diana_events', 'Community Meditation Session', 'Organize weekly group meditation', 'events', 125, 'completed');
