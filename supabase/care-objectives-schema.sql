-- Create care_objectives table
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mentorship', 'content', 'support', 'events')),
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'active', 'completed', 'verified')),
  assigned_to UUID REFERENCES auth.users(id),
  evidence_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id)
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  username TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  last_checkin_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  gratitude TEXT,
  is_public BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checkin_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, checkin_date)
);

-- Insert sample care objectives
INSERT INTO care_objectives (title, description, category, points, status) VALUES
('Onboard 5 New Members', 'Help 5 new community members get started with their wellness journey', 'mentorship', 100, 'available'),
('Create Meditation Guide', 'Write a comprehensive guide on daily meditation practices', 'content', 75, 'available'),
('Weekly Support Sessions', 'Host weekly peer support sessions for community members', 'support', 50, 'available'),
('Community Wellness Workshop', 'Organize and facilitate a community wellness workshop', 'events', 125, 'available'),
('Mental Health Resource List', 'Compile a list of mental health resources and tools', 'content', 60, 'available'),
('Buddy System Setup', 'Create and manage a buddy system for new members', 'mentorship', 80, 'available'),
('Gratitude Challenge', 'Design and run a 30-day gratitude challenge', 'events', 90, 'available'),
('Crisis Support Training', 'Complete training to provide crisis support to community members', 'support', 120, 'available');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_care_objectives_status ON care_objectives(status);
CREATE INDEX IF NOT EXISTS idx_care_objectives_assigned_to ON care_objectives(assigned_to);
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date);

-- Enable RLS
ALTER TABLE care_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Care objectives are viewable by everyone" ON care_objectives FOR SELECT USING (true);
CREATE POLICY "User profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can view their own checkins" ON daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own checkins" ON daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Function to update user stats after checkin
CREATE OR REPLACE FUNCTION update_user_stats_after_checkin()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user profile stats
  UPDATE user_profiles 
  SET 
    total_checkins = total_checkins + 1,
    total_points = total_points + NEW.points,
    current_streak = NEW.streak,
    max_streak = GREATEST(max_streak, NEW.streak),
    last_checkin_date = NEW.checkin_date,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats
CREATE TRIGGER trigger_update_user_stats_after_checkin
  AFTER INSERT ON daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_checkin();
