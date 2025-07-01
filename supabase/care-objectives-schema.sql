-- Care Objectives Schema for GOOD CARE DApp
-- This creates the complete backend for managing care objectives

-- Create care_objectives table
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mentorship', 'content', 'support', 'events')),
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'verified')),
  evidence_url TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_care_objectives_user_id ON care_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_care_objectives_username ON care_objectives(username);
CREATE INDEX IF NOT EXISTS idx_care_objectives_status ON care_objectives(status);
CREATE INDEX IF NOT EXISTS idx_care_objectives_category ON care_objectives(category);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_care_objectives_updated_at 
    BEFORE UPDATE ON care_objectives 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE care_objectives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own objectives" ON care_objectives
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives" ON care_objectives
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policy (for service role)
CREATE POLICY "Service role can manage all objectives" ON care_objectives
    FOR ALL USING (auth.role() = 'service_role');

-- Insert sample objectives for testing
INSERT INTO care_objectives (username, title, description, category, points, status) VALUES
('alice_wellness', 'Onboard 5 New Members', 'Help 5 new community members complete their first check-in and understand the platform', 'mentorship', 100, 'assigned'),
('bob_mindful', 'Create Meditation Guide', 'Write a comprehensive guide on daily meditation practices for beginners', 'content', 75, 'active'),
('carol_care', 'Weekly Support Sessions', 'Host weekly peer support sessions for community members struggling with consistency', 'support', 50, 'completed'),
('david_zen', 'Community Wellness Workshop', 'Organize and facilitate a virtual wellness workshop for the entire community', 'events', 125, 'verified'),
('eve_growth', 'Mental Health Resource Hub', 'Curate and organize mental health resources for the community library', 'content', 75, 'assigned'),
('frank_helper', 'Buddy System Program', 'Create and manage a buddy system to pair new members with experienced ones', 'mentorship', 100, 'active');

-- Create view for leaderboard with objectives
CREATE OR REPLACE VIEW community_leaderboard AS
SELECT 
  u.id,
  u.username,
  u.wallet_address,
  u.avatar_url,
  COALESCE(c.total_checkins, 0) as total_checkins,
  COALESCE(c.current_streak, 0) as current_streak,
  COALESCE(c.self_care_points, 0) as self_care_points,
  COALESCE(o.community_points, 0) as community_points,
  (COALESCE(c.self_care_points, 0) + COALESCE(o.community_points, 0)) as total_points,
  COALESCE(c.recent_activity, ARRAY[]::text[]) as recent_activity,
  u.created_at as joined_at
FROM community_users u
LEFT JOIN (
  SELECT 
    user_id,
    username,
    COUNT(*) as total_checkins,
    MAX(current_streak) as current_streak,
    SUM(points_earned) as self_care_points,
    array_agg(DISTINCT DATE(created_at)::text ORDER BY DATE(created_at) DESC) 
      FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_activity
  FROM community_checkins 
  GROUP BY user_id, username
) c ON u.id = c.user_id
LEFT JOIN (
  SELECT 
    user_id,
    username,
    SUM(points) as community_points
  FROM care_objectives 
  WHERE status = 'verified'
  GROUP BY user_id, username
) o ON u.id = o.user_id
ORDER BY total_points DESC, total_checkins DESC;
