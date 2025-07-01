-- Create care_objectives table for community CARE points
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  wallet_address TEXT,
  objective_type TEXT NOT NULL DEFAULT 'community',
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'general',
  evidence_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_care_objectives_user_id ON care_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_care_objectives_status ON care_objectives(status);
CREATE INDEX IF NOT EXISTS idx_care_objectives_category ON care_objectives(category);
CREATE INDEX IF NOT EXISTS idx_care_objectives_created_at ON care_objectives(created_at);

-- Enable RLS
ALTER TABLE care_objectives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all completed objectives" ON care_objectives
  FOR SELECT USING (status = 'completed');

CREATE POLICY "Users can insert their own objectives" ON care_objectives
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own objectives" ON care_objectives
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create public_gratitude table for shared gratitude
CREATE TABLE IF NOT EXISTS public_gratitude (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  gratitude TEXT NOT NULL,
  mood TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for public_gratitude
ALTER TABLE public_gratitude ENABLE ROW LEVEL SECURITY;

-- RLS Policy for public_gratitude
CREATE POLICY "Anyone can view public gratitude" ON public_gratitude
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own gratitude" ON public_gratitude
  FOR INSERT WITH CHECK (true);

-- Add is_gratitude_public column to daily_checkins if it doesn't exist
ALTER TABLE daily_checkins 
ADD COLUMN IF NOT EXISTS is_gratitude_public BOOLEAN DEFAULT false;

-- Add resources_viewed column to daily_checkins if it doesn't exist
ALTER TABLE daily_checkins 
ADD COLUMN IF NOT EXISTS resources_viewed TEXT[] DEFAULT '{}';

-- Insert sample care objectives
INSERT INTO care_objectives (user_id, username, objective_type, title, description, points, category, status) VALUES
('demo_user_1', 'CareGiver_Alice', 'mentorship', 'Onboard 5 New Members', 'Help 5 new community members complete their first check-in', 100, 'mentorship', 'completed'),
('demo_user_2', 'Wellness_Bob', 'content', 'Create Wellness Guide', 'Write comprehensive guide on daily wellness practices', 75, 'content', 'completed'),
('demo_user_3', 'Helper_Carol', 'support', 'Community Support', 'Provide emotional support in community chat for 1 week', 50, 'support', 'completed'),
('demo_user_1', 'CareGiver_Alice', 'event', 'Organize Meditation Session', 'Host weekly group meditation for community', 125, 'events', 'completed');
