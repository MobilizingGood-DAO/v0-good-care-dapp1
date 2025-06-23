-- GOOD CARE Community Schema for Real-Time Leaderboard
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

-- Users can read all profiles (for leaderboard) but only update their own
CREATE POLICY "Anyone can view user profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Users can read all check-ins (for community features) but only insert their own
CREATE POLICY "Anyone can view check-ins" ON daily_checkins FOR SELECT USING (true);
CREATE POLICY "Users can insert own check-ins" ON daily_checkins FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Anyone can view stats (for leaderboard), users can update their own
CREATE POLICY "Anyone can view user stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Function to calculate level based on total points
CREATE OR REPLACE FUNCTION calculate_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(total_points / 100) + 1);
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats after check-in
CREATE OR REPLACE FUNCTION update_user_stats_after_checkin()
RETURNS TRIGGER AS $$
DECLARE
  current_stats RECORD;
  new_total_points INTEGER;
  new_total_checkins INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current stats
  SELECT * INTO current_stats FROM user_stats WHERE user_id = NEW.user_id;
  
  IF current_stats IS NULL THEN
    -- First check-in, create initial stats
    INSERT INTO user_stats (
      user_id, 
      total_points, 
      current_streak, 
      longest_streak, 
      level, 
      total_checkins, 
      last_checkin
    ) VALUES (
      NEW.user_id,
      NEW.points,
      NEW.streak,
      NEW.streak,
      calculate_level(NEW.points),
      1,
      NEW.date
    );
  ELSE
    -- Update existing stats
    new_total_points := current_stats.total_points + NEW.points;
    new_total_checkins := current_stats.total_checkins + 1;
    new_level := calculate_level(new_total_points);
    
    UPDATE user_stats SET
      total_points = new_total_points,
      current_streak = NEW.streak,
      longest_streak = GREATEST(current_stats.longest_streak, NEW.streak),
      level = new_level,
      total_checkins = new_total_checkins,
      last_checkin = NEW.date,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats after check-in
CREATE TRIGGER trigger_update_user_stats_after_checkin
  AFTER INSERT ON daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_checkin();

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
