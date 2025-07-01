-- Test data for GOOD CARE leaderboard
-- Run this in your Supabase SQL editor to populate sample data

-- First, ensure we have the required tables
-- (This should already exist from your schema)

-- Insert sample user profiles
INSERT INTO user_profiles (id, username, avatar_url, self_care_points, community_points, current_streak, created_at, updated_at)
VALUES 
  ('user-001', 'CareGiver_Sarah', '/placeholder.svg?height=40&width=40', 450, 120, 7, NOW() - INTERVAL '30 days', NOW()),
  ('user-002', 'MindfulMike', '/placeholder.svg?height=40&width=40', 380, 200, 5, NOW() - INTERVAL '25 days', NOW()),
  ('user-003', 'WellnessWanda', '/placeholder.svg?height=40&width=40', 520, 80, 12, NOW() - INTERVAL '45 days', NOW()),
  ('user-004', 'ZenZoe', '/placeholder.svg?height=40&width=40', 290, 150, 3, NOW() - INTERVAL '20 days', NOW()),
  ('user-005', 'HealingHank', '/placeholder.svg?height=40&width=40', 340, 90, 8, NOW() - INTERVAL '35 days', NOW()),
  ('user-006', 'CompassionateCarl', '/placeholder.svg?height=40&width=40', 180, 250, 2, NOW() - INTERVAL '15 days', NOW()),
  ('user-007', 'GratefulGrace', '/placeholder.svg?height=40&width=40', 410, 110, 6, NOW() - INTERVAL '28 days', NOW()),
  ('user-008', 'PeacefulPete', '/placeholder.svg?height=40&width=40', 260, 180, 4, NOW() - INTERVAL '22 days', NOW()),
  ('user-009', 'KindnessKim', '/placeholder.svg?height=40&width=40', 390, 140, 9, NOW() - INTERVAL '40 days', NOW()),
  ('user-010', 'SereneSteve', '/placeholder.svg?height=40&width=40', 310, 160, 1, NOW() - INTERVAL '12 days', NOW())
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  self_care_points = EXCLUDED.self_care_points,
  community_points = EXCLUDED.community_points,
  current_streak = EXCLUDED.current_streak,
  updated_at = NOW();

-- Insert sample daily check-ins for recent activity
INSERT INTO daily_checkins (id, user_id, mood, gratitude, reflection, points, created_at)
VALUES 
  -- Today's check-ins
  (gen_random_uuid(), 'user-001', 'grateful', 'Thankful for my morning meditation', 'Feeling centered and ready for the day', 15, NOW()),
  (gen_random_uuid(), 'user-003', 'peaceful', 'Grateful for nature walks', 'Connected with the earth today', 15, NOW()),
  (gen_random_uuid(), 'user-005', 'joyful', 'Thankful for family time', 'Shared laughter with loved ones', 20, NOW()),
  (gen_random_uuid(), 'user-007', 'content', 'Grateful for good health', 'Body feels strong and healthy', 15, NOW()),
  
  -- Yesterday's check-ins
  (gen_random_uuid(), 'user-001', 'calm', 'Thankful for quiet moments', 'Found peace in stillness', 15, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'user-002', 'hopeful', 'Grateful for new opportunities', 'Excited about future possibilities', 15, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'user-004', 'balanced', 'Thankful for yoga practice', 'Mind and body in harmony', 15, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'user-006', 'inspired', 'Grateful for creative flow', 'Art brought me joy today', 20, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'user-009', 'loving', 'Thankful for community support', 'Felt held by caring friends', 20, NOW() - INTERVAL '1 day'),
  
  -- 2 days ago
  (gen_random_uuid(), 'user-001', 'grateful', 'Thankful for morning coffee', 'Simple pleasures matter', 15, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'user-003', 'serene', 'Grateful for sunset colors', 'Beauty filled my heart', 15, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'user-005', 'centered', 'Thankful for breathing space', 'Mindful moments throughout day', 15, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'user-008', 'peaceful', 'Grateful for good books', 'Learning brings me joy', 15, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'user-010', 'content', 'Thankful for home comfort', 'Safe space to be myself', 15, NOW() - INTERVAL '2 days'),
  
  -- 3 days ago
  (gen_random_uuid(), 'user-002', 'joyful', 'Grateful for music', 'Songs lifted my spirits', 20, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'user-004', 'calm', 'Thankful for deep sleep', 'Rest restored my energy', 15, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'user-006', 'hopeful', 'Grateful for progress', 'Small steps forward', 15, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'user-007', 'loving', 'Thankful for pet cuddles', 'Unconditional love received', 20, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'user-009', 'balanced', 'Grateful for work-life harmony', 'Found good rhythm today', 15, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample care objectives (for community points)
INSERT INTO care_objectives (id, title, description, points_value, category, created_at)
VALUES 
  (gen_random_uuid(), 'Community Garden Helper', 'Volunteer 2 hours at local community garden', 50, 'community', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), 'Elderly Visit', 'Spend time with elderly neighbor or nursing home resident', 40, 'community', NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), 'Beach Cleanup', 'Participate in local beach or park cleanup event', 30, 'environment', NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), 'Food Bank Volunteer', 'Help sort and distribute food at local food bank', 45, 'community', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), 'Mentor Youth', 'Provide mentorship to young person in community', 60, 'community', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample user objective completions (for community points)
INSERT INTO user_objectives (id, user_id, objective_id, status, evidence, points_awarded, started_at, completed_at, verified_at)
SELECT 
  gen_random_uuid(),
  user_id,
  objective_id,
  'verified',
  'Completed with photos and reflection',
  points_value,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days'
FROM (
  SELECT 'user-002' as user_id UNION ALL
  SELECT 'user-003' UNION ALL
  SELECT 'user-006' UNION ALL
  SELECT 'user-009'
) users
CROSS JOIN (
  SELECT id as objective_id, points_value 
  FROM care_objectives 
  LIMIT 2
) objectives
ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT 
  'User Profiles' as table_name,
  COUNT(*) as record_count
FROM user_profiles
WHERE id LIKE 'user-%'

UNION ALL

SELECT 
  'Daily Check-ins' as table_name,
  COUNT(*) as record_count
FROM daily_checkins
WHERE user_id LIKE 'user-%'

UNION ALL

SELECT 
  'Care Objectives' as table_name,
  COUNT(*) as record_count
FROM care_objectives

UNION ALL

SELECT 
  'User Objectives' as table_name,
  COUNT(*) as record_count
FROM user_objectives
WHERE user_id LIKE 'user-%';

-- Show sample leaderboard data
SELECT 
  username,
  self_care_points,
  community_points,
  (self_care_points + community_points) as total_points,
  current_streak
FROM user_profiles 
WHERE id LIKE 'user-%'
ORDER BY (self_care_points + community_points) DESC
LIMIT 10;
