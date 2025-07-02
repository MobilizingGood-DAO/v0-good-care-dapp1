-- Test data for GOOD CARE leaderboard
-- Run this in your Supabase SQL editor to populate sample data

-- First, ensure we have the required tables
-- (This assumes you've already run the main schema)

-- Insert sample user profiles
INSERT INTO user_profiles (
  user_id,
  username,
  wallet_address,
  self_care_points,
  community_points,
  total_checkins,
  current_streak,
  last_checkin_date,
  created_at,
  updated_at
) VALUES
  ('user_001', 'CareGiver_Alice', '0x1234567890123456789012345678901234567890', 450, 125, 45, 7, NOW() - INTERVAL '0 days', NOW() - INTERVAL '30 days', NOW()),
  ('user_002', 'Wellness_Bob', '0x2345678901234567890123456789012345678901', 380, 200, 38, 5, NOW() - INTERVAL '0 days', NOW() - INTERVAL '25 days', NOW()),
  ('user_003', 'Mindful_Carol', '0x3456789012345678901234567890123456789012', 520, 75, 52, 12, NOW() - INTERVAL '0 days', NOW() - INTERVAL '35 days', NOW()),
  ('user_004', 'Zen_David', '0x4567890123456789012345678901234567890123', 290, 150, 29, 3, NOW() - INTERVAL '1 days', NOW() - INTERVAL '20 days', NOW()),
  ('user_005', 'Peaceful_Emma', '0x5678901234567890123456789012345678901234', 610, 300, 61, 15, NOW() - INTERVAL '0 days', NOW() - INTERVAL '40 days', NOW()),
  ('user_006', 'Calm_Frank', '0x6789012345678901234567890123456789012345', 180, 50, 18, 1, NOW() - INTERVAL '0 days', NOW() - INTERVAL '15 days', NOW()),
  ('user_007', 'Serene_Grace', '0x7890123456789012345678901234567890123456', 340, 175, 34, 8, NOW() - INTERVAL '0 days', NOW() - INTERVAL '28 days', NOW()),
  ('user_008', 'Harmony_Henry', '0x8901234567890123456789012345678901234567', 420, 225, 42, 6, NOW() - INTERVAL '0 days', NOW() - INTERVAL '32 days', NOW()),
  ('user_009', 'Balance_Iris', '0x9012345678901234567890123456789012345678', 150, 25, 15, 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '12 days', NOW()),
  ('user_010', 'Gentle_Jack', '0x0123456789012345678901234567890123456789', 480, 350, 48, 10, NOW() - INTERVAL '0 days', NOW() - INTERVAL '38 days', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  wallet_address = EXCLUDED.wallet_address,
  self_care_points = EXCLUDED.self_care_points,
  community_points = EXCLUDED.community_points,
  total_checkins = EXCLUDED.total_checkins,
  current_streak = EXCLUDED.current_streak,
  last_checkin_date = EXCLUDED.last_checkin_date,
  updated_at = NOW();

-- Insert sample daily check-ins (recent activity)
INSERT INTO daily_checkins (
  user_id,
  mood_rating,
  gratitude_note,
  points_earned,
  is_public,
  created_at
) VALUES
  -- Alice's check-ins (7-day streak)
  ('user_001', 8, 'Grateful for morning meditation', 15, true, NOW() - INTERVAL '0 days'),
  ('user_001', 7, 'Thankful for family time', 15, true, NOW() - INTERVAL '1 days'),
  ('user_001', 9, 'Appreciated nature walk', 15, true, NOW() - INTERVAL '2 days'),
  ('user_001', 6, 'Grateful for good health', 15, true, NOW() - INTERVAL '3 days'),
  ('user_001', 8, 'Thankful for peaceful evening', 15, true, NOW() - INTERVAL '4 days'),
  ('user_001', 7, 'Appreciated kind gestures', 15, true, NOW() - INTERVAL '5 days'),
  ('user_001', 9, 'Grateful for new opportunities', 15, true, NOW() - INTERVAL '6 days'),
  
  -- Bob's check-ins (5-day streak)
  ('user_002', 7, 'Thankful for supportive friends', 15, true, NOW() - INTERVAL '0 days'),
  ('user_002', 8, 'Grateful for learning something new', 15, true, NOW() - INTERVAL '1 days'),
  ('user_002', 6, 'Appreciated quiet moments', 15, true, NOW() - INTERVAL '2 days'),
  ('user_002', 9, 'Thankful for creative inspiration', 15, true, NOW() - INTERVAL '3 days'),
  ('user_002', 7, 'Grateful for good food', 15, true, NOW() - INTERVAL '4 days'),
  
  -- Carol's check-ins (12-day streak - partial)
  ('user_003', 9, 'Grateful for mindfulness practice', 15, true, NOW() - INTERVAL '0 days'),
  ('user_003', 8, 'Thankful for inner peace', 15, true, NOW() - INTERVAL '1 days'),
  ('user_003', 7, 'Appreciated present moment', 15, true, NOW() - INTERVAL '2 days'),
  
  -- Emma's check-ins (15-day streak - partial)
  ('user_005', 9, 'Grateful for community support', 15, true, NOW() - INTERVAL '0 days'),
  ('user_005', 8, 'Thankful for personal growth', 15, true, NOW() - INTERVAL '1 days'),
  ('user_005', 9, 'Appreciated acts of kindness', 15, true, NOW() - INTERVAL '2 days'),
  
  -- Jack's check-ins (10-day streak - partial)
  ('user_010', 8, 'Grateful for gentle reminders', 15, true, NOW() - INTERVAL '0 days'),
  ('user_010', 7, 'Thankful for patience', 15, true, NOW() - INTERVAL '1 days'),
  ('user_010', 9, 'Appreciated compassionate moments', 15, true, NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Insert sample care objectives
INSERT INTO care_objectives (
  title,
  description,
  category,
  points_value,
  difficulty_level,
  is_active,
  created_at
) VALUES
  ('Daily Meditation', 'Practice mindfulness meditation for 10 minutes', 'mindfulness', 25, 'beginner', true, NOW()),
  ('Gratitude Journal', 'Write down 3 things you are grateful for', 'gratitude', 20, 'beginner', true, NOW()),
  ('Nature Walk', 'Spend 30 minutes in nature', 'physical', 30, 'beginner', true, NOW()),
  ('Random Act of Kindness', 'Perform one kind act for someone else', 'community', 40, 'intermediate', true, NOW()),
  ('Digital Detox Hour', 'Spend 1 hour without digital devices', 'wellness', 35, 'intermediate', true, NOW()),
  ('Healthy Meal Prep', 'Prepare a nutritious meal mindfully', 'nutrition', 30, 'beginner', true, NOW()),
  ('Community Volunteer', 'Volunteer for a local cause', 'community', 75, 'advanced', true, NOW()),
  ('Breathing Exercise', 'Practice deep breathing for 5 minutes', 'mindfulness', 15, 'beginner', true, NOW())
ON CONFLICT (title) DO NOTHING;

-- Insert sample user objective progress
INSERT INTO user_objective_progress (
  user_id,
  objective_id,
  status,
  evidence_text,
  completed_at,
  is_verified,
  points_awarded,
  created_at,
  updated_at
) VALUES
  -- Alice's completed objectives
  ('user_001', (SELECT id FROM care_objectives WHERE title = 'Daily Meditation' LIMIT 1), 'completed', 'Completed 10-minute morning meditation using Headspace app', NOW() - INTERVAL '1 days', true, 25, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days'),
  ('user_001', (SELECT id FROM care_objectives WHERE title = 'Gratitude Journal' LIMIT 1), 'completed', 'Wrote gratitude entries for family, health, and opportunities', NOW() - INTERVAL '2 days', true, 20, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
  
  -- Bob's completed objectives
  ('user_002', (SELECT id FROM care_objectives WHERE title = 'Nature Walk' LIMIT 1), 'completed', 'Walked in Central Park for 45 minutes, observed birds and trees', NOW() - INTERVAL '1 days', true, 30, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days'),
  ('user_002', (SELECT id FROM care_objectives WHERE title = 'Random Act of Kindness' LIMIT 1), 'completed', 'Helped elderly neighbor with groceries', NOW() - INTERVAL '3 days', true, 40, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
  
  -- Emma's completed objectives (highest community points)
  ('user_005', (SELECT id FROM care_objectives WHERE title = 'Community Volunteer' LIMIT 1), 'completed', 'Volunteered at local food bank for 4 hours', NOW() - INTERVAL '5 days', true, 75, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
  ('user_005', (SELECT id FROM care_objectives WHERE title = 'Digital Detox Hour' LIMIT 1), 'completed', 'Spent 2 hours reading without phone or computer', NOW() - INTERVAL '2 days', true, 35, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
  ('user_005', (SELECT id FROM care_objectives WHERE title = 'Healthy Meal Prep' LIMIT 1), 'completed', 'Prepared mindful vegetarian meal with fresh ingredients', NOW() - INTERVAL '1 days', true, 30, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days'),
  
  -- Jack's completed objectives
  ('user_010', (SELECT id FROM care_objectives WHERE title = 'Breathing Exercise' LIMIT 1), 'completed', 'Practiced 4-7-8 breathing technique for stress relief', NOW() - INTERVAL '1 days', true, 15, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days'),
  ('user_010', (SELECT id FROM care_objectives WHERE title = 'Random Act of Kindness' LIMIT 1), 'completed', 'Donated clothes to local shelter', NOW() - INTERVAL '4 days', true, 40, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;

-- Create or update the increment_community_points function
CREATE OR REPLACE FUNCTION increment_community_points(user_id TEXT, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    community_points = COALESCE(community_points, 0) + points_to_add,
    updated_at = NOW()
  WHERE user_profiles.user_id = increment_community_points.user_id;
  
  -- Insert if user doesn't exist
  IF NOT FOUND THEN
    INSERT INTO user_profiles (user_id, community_points, created_at, updated_at)
    VALUES (increment_community_points.user_id, points_to_add, NOW(), NOW());
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Verify the data
SELECT 
  username,
  self_care_points,
  community_points,
  (self_care_points + community_points) as total_points,
  current_streak,
  total_checkins
FROM user_profiles 
ORDER BY (self_care_points + community_points) DESC;

-- Show summary
SELECT 
  COUNT(*) as total_users,
  SUM(self_care_points) as total_self_care_points,
  SUM(community_points) as total_community_points,
  SUM(self_care_points + community_points) as total_points,
  ROUND(AVG(self_care_points + community_points)) as avg_points_per_user,
  COUNT(CASE WHEN current_streak > 0 THEN 1 END) as active_users
FROM user_profiles;
