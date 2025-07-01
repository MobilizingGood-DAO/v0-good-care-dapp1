-- Test data for GOOD CARE leaderboard
-- Run this in your Supabase SQL editor to populate sample data

-- First, ensure we have the user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  username TEXT UNIQUE,
  wallet_address TEXT,
  avatar_url TEXT,
  self_care_points INTEGER DEFAULT 0,
  community_points INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample users with varying points and activity
INSERT INTO user_profiles (user_id, username, wallet_address, self_care_points, community_points, total_checkins, current_streak) VALUES
  (gen_random_uuid(), 'CareGiver_Alice', '0x1234...5678', 450, 120, 45, 7),
  (gen_random_uuid(), 'Mindful_Bob', '0x2345...6789', 380, 95, 38, 5),
  (gen_random_uuid(), 'Wellness_Carol', '0x3456...7890', 320, 180, 32, 3),
  (gen_random_uuid(), 'Healing_Dave', '0x4567...8901', 290, 85, 29, 0),
  (gen_random_uuid(), 'Peaceful_Eve', '0x5678...9012', 275, 110, 27, 2),
  (gen_random_uuid(), 'Grateful_Frank', '0x6789...0123', 240, 75, 24, 1),
  (gen_random_uuid(), 'Loving_Grace', '0x7890...1234', 220, 90, 22, 4),
  (gen_random_uuid(), 'Calm_Henry', '0x8901...2345', 195, 65, 19, 0),
  (gen_random_uuid(), 'Serene_Iris', '0x9012...3456', 180, 55, 18, 6),
  (gen_random_uuid(), 'Zen_Jack', '0x0123...4567', 165, 45, 16, 1)
ON CONFLICT (username) DO UPDATE SET
  self_care_points = EXCLUDED.self_care_points,
  community_points = EXCLUDED.community_points,
  total_checkins = EXCLUDED.total_checkins,
  current_streak = EXCLUDED.current_streak,
  updated_at = NOW();

-- Create daily_checkins table if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  gratitude TEXT,
  reflection TEXT,
  is_public BOOLEAN DEFAULT true,
  points_earned INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some recent check-ins
INSERT INTO daily_checkins (user_id, username, mood, gratitude, points_earned) 
SELECT 
  up.user_id,
  up.username,
  (RANDOM() * 4 + 1)::INTEGER,
  CASE 
    WHEN RANDOM() > 0.5 THEN 'Grateful for this beautiful day and the opportunity to practice self-care'
    ELSE 'Thankful for my health and the support of this community'
  END,
  10 + (RANDOM() * 15)::INTEGER
FROM user_profiles up
WHERE up.current_streak > 0
ORDER BY RANDOM()
LIMIT 15;

-- Create care_objectives table if it doesn't exist
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'wellness',
  points_reward INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample care objectives
INSERT INTO care_objectives (title, description, points_reward) VALUES
  ('Daily Meditation', 'Complete 10 minutes of mindful meditation', 25),
  ('Gratitude Journal', 'Write 3 things you are grateful for', 20),
  ('Nature Walk', 'Take a 30-minute walk in nature', 30),
  ('Digital Detox', 'Spend 2 hours without screens', 40),
  ('Acts of Kindness', 'Perform 3 random acts of kindness', 50),
  ('Healthy Meal Prep', 'Prepare a nutritious meal from scratch', 35),
  ('Community Support', 'Help another community member', 60),
  ('Mindful Breathing', 'Practice breathing exercises for 15 minutes', 25)
ON CONFLICT DO NOTHING;

-- Update user profiles with calculated totals (this would normally be done by triggers)
UPDATE user_profiles SET
  updated_at = NOW()
WHERE id IN (SELECT id FROM user_profiles LIMIT 10);

-- Show the results
SELECT 
  username,
  self_care_points,
  community_points,
  (self_care_points + community_points) as total_points,
  current_streak,
  total_checkins
FROM user_profiles 
ORDER BY (self_care_points + community_points) DESC;

-- Show community stats
SELECT 
  COUNT(*) as total_users,
  SUM(self_care_points) as total_self_care_points,
  SUM(community_points) as total_community_points,
  SUM(self_care_points + community_points) as total_points,
  ROUND(AVG(self_care_points + community_points)) as average_points_per_user,
  COUNT(*) FILTER (WHERE current_streak > 0) as active_users
FROM user_profiles;
