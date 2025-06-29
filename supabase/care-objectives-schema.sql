-- Create care_objectives table for community CARE points
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  wallet_address TEXT,
  objective_type TEXT NOT NULL DEFAULT 'community',
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  evidence_url TEXT,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

CREATE POLICY "Users can view their own objectives" ON care_objectives
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own objectives" ON care_objectives
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own pending objectives" ON care_objectives
  FOR UPDATE USING (auth.uid()::text = user_id::text AND status = 'pending');

-- Create public_gratitude table for shared gratitude
CREATE TABLE IF NOT EXISTS public_gratitude (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  gratitude TEXT NOT NULL,
  mood TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for public_gratitude
ALTER TABLE public_gratitude ENABLE ROW LEVEL SECURITY;

-- RLS Policy for public_gratitude (everyone can read, only owner can insert)
CREATE POLICY "Anyone can view public gratitude" ON public_gratitude
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own gratitude" ON public_gratitude
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Add is_gratitude_public column to daily_checkins if it doesn't exist
ALTER TABLE daily_checkins 
ADD COLUMN IF NOT EXISTS is_gratitude_public BOOLEAN DEFAULT false;

-- Insert sample care objectives for demo
INSERT INTO care_objectives (user_id, username, wallet_address, objective_type, title, description, points, category, status, completed_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'CareGiver1', '0x1234567890123456789012345678901234567890', 'mentorship', 'Onboard 5 New Members', 'Successfully onboarded 5 new community members with intro calls and resource sharing', 100, 'mentorship', 'completed', NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Helper2', '0x2345678901234567890123456789012345678901', 'content', 'Create Wellness Guide', 'Created comprehensive wellness guide with 10 self-care practices', 75, 'content', 'completed', NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Supporter3', '0x3456789012345678901234567890123456789012', 'support', 'Weekly Check-in Support', 'Provided emotional support and encouragement to 3 community members', 50, 'support', 'completed', NOW() - INTERVAL '3 hours'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Organizer4', '0x4567890123456789012345678901234567890123', 'events', 'Community Meditation Session', 'Organized and led a 1-hour community meditation session with 15 participants', 125, 'events', 'completed', NOW() - INTERVAL '1 week');

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for care_objectives
CREATE TRIGGER update_care_objectives_updated_at 
  BEFORE UPDATE ON care_objectives 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
