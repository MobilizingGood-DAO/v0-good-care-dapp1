-- Test data for GOOD CARE leaderboard
-- Run this in your Supabase SQL editor

-- First, ensure we have the required tables
-- (This should already exist from your schema)

-- Insert test users into user_profiles
INSERT INTO user_profiles (
  id, 
  username, 
  avatar_url, 
  self_care_points, 
  community_points, 
  current_streak,
  last_checkin_date,
  created_at
) VALUES 
  ('user-001', 'CareGiver_Sarah', '/placeholder.svg?height=40&width=40', 450, 200, 12, NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 days'),
  ('user-002', 'Mindful_Mike', '/placeholder.svg?height=40&width=40', 380, 150, 8, NOW() - INTERVAL '1 day', NOW() - INTERVAL '25 days'),
  ('user-003', 'Wellness_Warrior', '/placeholder.svg?height=40&width=40', 520, 300, 15, NOW(), NOW() - INTERVAL '45 days'),
  ('user-004', 'Gratitude_Grace', '/placeholder.svg?height=40&width=40', 290, 100, 5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '20 days'),
  ('user-005', 'Healing_Heart', '/placeholder.svg?height=40&width=40', 410, 180, 10, NOW(), NOW() - INTERVAL '35 days'),
  ('user-006', 'Peaceful_Pat', '/placeholder.svg?height=40&width=40', 350, 120, 7, NOW() - INTERVAL '1 day', NOW() - INTERVAL '15 days'),
  ('user-007', 'Joyful_Jordan', '/placeholder.svg?height=40&width=40', 480, 250, 14, NOW(), NOW() - INTERVAL '40 days'),
  ('user-008', 'Calm_Chris', '/placeholder.svg?height=40&width=40', 320, 90, 6, NOW() - INTERVAL '3 days', NOW() - INTERVAL '18 days'),
  ('user-009', 'Bright_Bailey', '/placeholder.svg?height=40&width=40', 390, 160, 9, NOW() - INTERVAL '1 day', NOW() - INTERVAL '28 days'),
  ('user-010', 'Serene_Sam', '/placeholder.svg?height=40&width=40', 440, 220, 11, NOW(), NOW() - INTERVAL '32 days')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  avatar_url = EXCLUDED.avatar_url,
  self_care_points = EXCLUDED.self_care_points,
  community_points = EXCLUDED.community_points,
  current_streak = EXCLUDED.current_streak,
  last_checkin_date = EXCLUDED.last_checkin_date;

-- Insert recent daily check-ins for activity tracking
INSERT INTO daily_checkins (
  user_id,
  mood,
  gratitude,
  points_earned,
  created_at
) VALUES 
  -- Recent check-ins for active users
  ('user-001', 'grateful', 'Thankful for my morning meditation', 15, NOW() - INTERVAL '1 day'),
  ('user-001', 'peaceful', 'Enjoyed a walk in nature', 12, NOW() - INTERVAL '2 days'),
  ('user-003', 'energized', 'Great workout session today', 18, NOW()),
  ('user-003', 'content', 'Quality time with family', 14, NOW() - INTERVAL '1 day'),
  ('user-005', 'hopeful', 'Made progress on personal goals', 16, NOW()),
  ('user-007', 'joyful', 'Helped a neighbor today', 20, NOW()),
  ('user-007', 'calm', 'Evening yoga practice', 13, NOW() - INTERVAL '1 day'),
  ('user-009', 'grateful', 'Appreciated small moments', 11, NOW() - INTERVAL '1 day'),
  ('user-010', 'balanced', 'Good work-life balance today', 17, NOW())
ON CONFLICT DO NOTHING;

-- Insert some care objectives for community points
INSERT INTO care_objectives (
  id,
  user_id,
  title,
  description,
  category,
  points_value,
  status,
  created_at,
  completed_at,
  verified_at
) VALUES 
  ('obj-001', 'user-003', 'Community Garden Volunteer', 'Spent 4 hours helping at local community garden', 'community', 100, 'verified', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
  ('obj-002', 'user-007', 'Mental Health Workshop', 'Attended and completed mental wellness workshop', 'education', 75, 'verified', NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
  ('obj-003', 'user-001', 'Peer Support Session', 'Led a peer support group meeting', 'community', 125, 'verified', NOW() - INTERVAL '10 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '3 days'),
  ('obj-004', 'user-010', 'Mindfulness Challenge', 'Completed 30-day mindfulness challenge', 'personal', 150, 'verified', NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '4 days'),
  ('obj-005', 'user-005', 'Wellness Blog Post', 'Wrote and shared wellness tips blog post', 'sharing', 50, 'verified', NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
  ('obj-006', 'user-002', 'Exercise Buddy Program', 'Partnered with someone for weekly exercise', 'community', 80, 'completed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days', NULL),
  ('obj-007', 'user-009', 'Gratitude Journal', 'Maintained daily gratitude journal for 2 weeks', 'personal', 60, 'verified', NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  completed_at = EXCLUDED.completed_at,
  verified_at = EXCLUDED.verified_at;

-- Verify the data was inserted
SELECT 
  username,
  self_care_points,
  community_points,
  (self_care_points + community_points) as total_points,
  current_streak
FROM user_profiles 
ORDER BY (self_care_points + community_points) DESC;

-- Show recent activity
SELECT 
  up.username,
  dc.mood,
  dc.points_earned,
  dc.created_at
FROM daily_checkins dc
JOIN user_profiles up ON dc.user_id = up.id
ORDER BY dc.created_at DESC
LIMIT 10;

-- Show care objectives
SELECT 
  up.username,
  co.title,
  co.points_value,
  co.status
FROM care_objectives co
JOIN user_profiles up ON co.user_id = up.id
ORDER BY co.created_at DESC;
