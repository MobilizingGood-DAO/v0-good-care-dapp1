-- Create care_objectives table
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

-- Create RLS policies
ALTER TABLE care_objectives ENABLE ROW LEVEL SECURITY;

-- Users can view all objectives
CREATE POLICY "Users can view all care objectives" ON care_objectives
  FOR SELECT USING (true);

-- Users can insert their own objectives
CREATE POLICY "Users can insert their own care objectives" ON care_objectives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own objectives
CREATE POLICY "Users can update their own care objectives" ON care_objectives
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_care_objectives_user_id ON care_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_care_objectives_status ON care_objectives(status);
CREATE INDEX IF NOT EXISTS idx_care_objectives_category ON care_objectives(category);

-- Insert sample objectives
INSERT INTO care_objectives (user_id, username, title, description, category, points, status) VALUES
  (gen_random_uuid(), 'alice_care', 'Onboard 5 New Members', 'Help 5 new community members get started with their GOOD Passport', 'mentorship', 100, 'active'),
  (gen_random_uuid(), 'bob_wellness', 'Create Wellness Guide', 'Write a comprehensive guide on daily wellness practices', 'content', 75, 'completed'),
  (gen_random_uuid(), 'carol_support', 'Weekly Check-in Support', 'Provide encouragement and support during weekly community check-ins', 'support', 50, 'active'),
  (gen_random_uuid(), 'david_events', 'Community Meditation Session', 'Organize and lead a group meditation session for the community', 'events', 125, 'completed');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_care_objectives_updated_at 
  BEFORE UPDATE ON care_objectives 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
