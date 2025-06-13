-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  username TEXT UNIQUE,
  social_provider TEXT,
  social_id TEXT,
  wallet_id TEXT, -- AvaCloud wallet ID for embedded wallets
  wallet_type TEXT DEFAULT 'external', -- 'embedded' or 'external'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  emoji TEXT NOT NULL,
  mood_value INTEGER NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  gratitude_note TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  streak_multiplier DECIMAL(3,2) DEFAULT 1.0,
  final_points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin DATE,
  total_checkins INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON checkins(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_points ON user_stats(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_social_id ON users(social_id);

-- Function to update user stats after check-in
CREATE OR REPLACE FUNCTION update_user_stats_after_checkin()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user stats
  INSERT INTO user_stats (user_id, total_points, total_checkins, last_checkin, updated_at)
  VALUES (
    NEW.user_id,
    NEW.final_points,
    1,
    DATE(NEW.timestamp),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_stats.total_points + NEW.final_points,
    total_checkins = user_stats.total_checkins + 1,
    last_checkin = DATE(NEW.timestamp),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating user stats
DROP TRIGGER IF EXISTS trigger_update_user_stats ON checkins;
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT ON checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_checkin();
