-- GOOD CARE Community Schema - Complete Setup
-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS daily_checkins CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table: stores user profile (wallet address, username, avatar)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  email TEXT,
  avatar TEXT,
  social_provider TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily check-ins table: stores each mood/gratitude check-in
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  mood_label TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  streak INTEGER NOT NULL DEFAULT 1,
  gratitude_note TEXT,
  resources_viewed TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one check-in per user per day
  UNIQUE(user_id, date)
);

-- User stats table: aggregates total CARE points, streaks, etc.
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_checkins INTEGER DEFAULT 0,
  last_checkin DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daily_checkins_user_date ON daily_checkins(user_id, date DESC);
CREATE INDEX idx_user_stats_points ON user_stats(total_points DESC);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for leaderboard functionality
CREATE POLICY "Anyone can view user profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can view check-ins" ON daily_checkins FOR SELECT USING (true);
CREATE POLICY "Anyone can view user stats" ON user_stats FOR SELECT USING (true);

-- Users can only modify their own data (when we add auth)
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert own check-ins" ON daily_checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (true);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (true);

-- Function to calculate level based on total points
CREATE OR REPLACE FUNCTION calculate_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(total_points / 100) + 1);
END;
$$ LANGUAGE plpgsql;

-- Leaderboard view for easy querying
CREATE VIEW leaderboard AS
SELECT 
  u.id as user_id,
  u.username,
  u.wallet_address,
  u.avatar,
  us.total_points,
  us.current_streak,
  us.longest_streak,
  us.level,
  us.total_checkins,
  us.last_checkin,
  ROW_NUMBER() OVER (ORDER BY us.total_points DESC, us.longest_streak DESC) as rank
FROM users u
JOIN user_stats us ON u.id = us.user_id
ORDER BY us.total_points DESC, us.longest_streak DESC;

-- Insert some demo data for testing
INSERT INTO users (wallet_address, username) VALUES
('0x1234567890123456789012345678901234567890', 'CareGiver_Alice'),
('0x2345678901234567890123456789012345678901', 'Wellness_Bob'),
('0x3456789012345678901234567890123456789012', 'Mindful_Carol'),
('0x4567890123456789012345678901234567890123', 'Grateful_Dave'),
('0x5678901234567890123456789012345678901234', 'Peaceful_Eve');

-- Insert demo user stats
INSERT INTO user_stats (user_id, total_points, current_streak, longest_streak, level, total_checkins, last_checkin)
SELECT 
  u.id,
  CASE 
    WHEN u.username = 'CareGiver_Alice' THEN 850
    WHEN u.username = 'Wellness_Bob' THEN 720
    WHEN u.username = 'Mindful_Carol' THEN 650
    WHEN u.username = 'Grateful_Dave' THEN 580
    WHEN u.username = 'Peaceful_Eve' THEN 420
  END as total_points,
  CASE 
    WHEN u.username = 'CareGiver_Alice' THEN 12
    WHEN u.username = 'Wellness_Bob' THEN 8
    WHEN u.username = 'Mindful_Carol' THEN 15
    WHEN u.username = 'Grateful_Dave' THEN 5
    WHEN u.username = 'Peaceful_Eve' THEN 3
  END as current_streak,
  CASE 
    WHEN u.username = 'CareGiver_Alice' THEN 12
    WHEN u.username = 'Wellness_Bob' THEN 8
    WHEN u.username = 'Mindful_Carol' THEN 15
    WHEN u.username = 'Grateful_Dave' THEN 5
    WHEN u.username = 'Peaceful_Eve' THEN 3
  END as longest_streak,
  CASE 
    WHEN u.username = 'CareGiver_Alice' THEN 9
    WHEN u.username = 'Wellness_Bob' THEN 8
    WHEN u.username = 'Mindful_Carol' THEN 7
    WHEN u.username = 'Grateful_Dave' THEN 6
    WHEN u.username = 'Peaceful_Eve' THEN 5
  END as level,
  CASE 
    WHEN u.username = 'CareGiver_Alice' THEN 25
    WHEN u.username = 'Wellness_Bob' THEN 18
    WHEN u.username = 'Mindful_Carol' THEN 22
    WHEN u.username = 'Grateful_Dave' THEN 16
    WHEN u.username = 'Peaceful_Eve' THEN 12
  END as total_checkins,
  CURRENT_DATE as last_checkin
FROM users u;
