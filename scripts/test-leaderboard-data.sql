-- Test script to add sample data for leaderboard testing
-- Run this in your Supabase SQL editor to populate test data

-- Insert test users if they don't exist
INSERT INTO user_profiles (user_id, username, wallet_address, total_points, total_checkins, current_streak, created_at)
VALUES 
  ('test-user-1', 'Alice Wellness', '0x1234...5678', 150, 15, 5, NOW() - INTERVAL '30 days'),
  ('test-user-2', 'Bob Mindful', '0x2345...6789', 120, 12, 3, NOW() - INTERVAL '25 days'),
  ('test-user-3', 'Carol Care', '0x3456...7890', 200, 20, 7, NOW() - INTERVAL '20 days'),
  ('test-user-4', 'David Zen', '0x4567...8901', 80, 8, 2, NOW() - INTERVAL '15 days'),
  ('test-user-5', 'Eva Harmony', '0x5678...9012', 180, 18, 6, NOW() - INTERVAL '10 days')
ON CONFLICT (user_id) DO UPDATE SET
  total_points = EXCLUDED.total_points,
  total_checkins = EXCLUDED.total_checkins,
  current_streak = EXCLUDED.current_streak;

-- Insert test daily checkins for recent activity
INSERT INTO daily_checkins (user_id, checkin_date, mood_score, gratitude_text, created_at)
VALUES 
  -- Alice's checkins
  ('test-user-1', CURRENT_DATE, 8, 'Grateful for a peaceful morning', NOW()),
  ('test-user-1', CURRENT_DATE - 1, 7, 'Thankful for good friends', NOW() - INTERVAL '1 day'),
  ('test-user-1', CURRENT_DATE - 2, 9, 'Appreciating nature', NOW() - INTERVAL '2 days'),
  
  -- Bob's checkins
  ('test-user-2', CURRENT_DATE, 6, 'Grateful for family time', NOW()),
  ('test-user-2', CURRENT_DATE - 1, 8, 'Thankful for good health', NOW() - INTERVAL '1 day'),
  
  -- Carol's checkins
  ('test-user-3', CURRENT_DATE, 9, 'Grateful for new opportunities', NOW()),
  ('test-user-3', CURRENT_DATE - 1, 8, 'Thankful for learning', NOW() - INTERVAL '1 day'),
  ('test-user-3', CURRENT_DATE - 2, 7, 'Appreciating creativity', NOW() - INTERVAL '2 days'),
  ('test-user-3', CURRENT_DATE - 3, 8, 'Grateful for progress', NOW() - INTERVAL '3 days'),
  
  -- David's checkins
  ('test-user-4', CURRENT_DATE - 1, 7, 'Thankful for rest', NOW() - INTERVAL '1 day'),
  
  -- Eva's checkins
  ('test-user-5', CURRENT_DATE, 8, 'Grateful for balance', NOW()),
  ('test-user-5', CURRENT_DATE - 1, 9, 'Thankful for growth', NOW() - INTERVAL '1 day'),
  ('test-user-5', CURRENT_DATE - 2, 7, 'Appreciating challenges', NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, checkin_date) DO NOTHING;

-- Insert test care objectives for community points
INSERT INTO care_objectives (title, description, points, assigned_to, status, created_at)
VALUES 
  ('Community Helper', 'Help 3 community members', 50, 'test-user-1', 'verified', NOW() - INTERVAL '5 days'),
  ('Wellness Mentor', 'Mentor new users', 75, 'test-user-3', 'verified', NOW() - INTERVAL '3 days'),
  ('Event Organizer', 'Organize community event', 100, 'test-user-5', 'verified', NOW() - INTERVAL '2 days'),
  ('Content Creator', 'Share wellness tips', 25, 'test-user-2', 'verified', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT 
  'User Profiles' as table_name,
  COUNT(*) as count
FROM user_profiles
WHERE user_id LIKE 'test-user-%'

UNION ALL

SELECT 
  'Daily Checkins' as table_name,
  COUNT(*) as count
FROM daily_checkins
WHERE user_id LIKE 'test-user-%'

UNION ALL

SELECT 
  'Care Objectives' as table_name,
  COUNT(*) as count
FROM care_objectives
WHERE assigned_to LIKE 'test-user-%';
