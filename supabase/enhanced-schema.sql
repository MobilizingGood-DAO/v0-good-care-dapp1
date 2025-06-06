-- Enhanced schema for GOOD CARE DApp

-- Enable RLS on all tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_stats ENABLE ROW LEVEL SECURITY;

-- Users table with wallet integration
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE NOT NULL,
  encrypted_private_key TEXT, -- Encrypted private key for export
  auth_provider TEXT DEFAULT 'wallet',
  oauth_id TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced checkins table with streak logic
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  emoji TEXT NOT NULL,
  prompt TEXT,
  streak_days INTEGER DEFAULT 1,
  base_points INTEGER DEFAULT 10,
  bonus_points INTEGER DEFAULT 0,
  multiplier DECIMAL(3,2) DEFAULT 1.00,
  care_earned INTEGER GENERATED ALWAYS AS (
    FLOOR((base_points + bonus_points) * multiplier)
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats for leaderboard
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  current_multiplier DECIMAL(3,2) DEFAULT 1.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet transactions log
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tx_hash TEXT UNIQUE NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  token_type TEXT NOT NULL, -- 'CARE' or 'GCT'
  amount DECIMAL(20,8) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own checkins" ON checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view leaderboard" ON user_stats FOR SELECT USING (true);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkins_user_timestamp ON checkins(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_points ON user_stats(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);

-- Function to calculate streak multiplier
CREATE OR REPLACE FUNCTION calculate_multiplier(streak_days INTEGER)
RETURNS DECIMAL(3,2) AS $$
BEGIN
  CASE 
    WHEN streak_days >= 14 THEN RETURN 2.00;
    WHEN streak_days >= 7 THEN RETURN 1.50;
    WHEN streak_days >= 3 THEN RETURN 1.25;
    ELSE RETURN 1.00;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats after checkin
CREATE OR REPLACE FUNCTION update_user_stats_after_checkin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, total_points, current_streak, longest_streak, last_checkin_date, current_multiplier)
  VALUES (
    NEW.user_id,
    NEW.care_earned,
    NEW.streak_days,
    NEW.streak_days,
    DATE(NEW.timestamp),
    NEW.multiplier
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_stats.total_points + NEW.care_earned,
    current_streak = NEW.streak_days,
    longest_streak = GREATEST(user_stats.longest_streak, NEW.streak_days),
    last_checkin_date = DATE(NEW.timestamp),
    current_multiplier = NEW.multiplier,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats after checkin
CREATE TRIGGER update_stats_after_checkin
  AFTER INSERT ON checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_checkin();
