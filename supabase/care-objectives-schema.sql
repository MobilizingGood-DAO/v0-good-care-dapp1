-- Create care_objectives table (manually managed through Supabase)
CREATE TABLE IF NOT EXISTS care_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('mentorship', 'content', 'support', 'events')),
  points INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'verified')),
  evidence_url TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_care_objectives_user_id ON care_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_care_objectives_username ON care_objectives(username);
CREATE INDEX IF NOT EXISTS idx_care_objectives_status ON care_objectives(status);
CREATE INDEX IF NOT EXISTS idx_care_objectives_category ON care_objectives(category);
CREATE INDEX IF NOT EXISTS idx_care_objectives_assigned_at ON care_objectives(assigned_at);

-- Enable RLS
ALTER TABLE care_objectives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all objectives" ON care_objectives FOR SELECT USING (true);
CREATE POLICY "Users can update their own objectives" ON care_objectives FOR UPDATE USING (username = current_setting('app.current_username', true));

-- Create public_gratitude table for public gratitude sharing
CREATE TABLE IF NOT EXISTS public_gratitude (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  gratitude TEXT NOT NULL,
  mood TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_public_gratitude_created_at ON public_gratitude(created_at);
CREATE INDEX IF NOT EXISTS idx_public_gratitude_username ON public_gratitude(username);

-- Enable RLS
ALTER TABLE public_gratitude ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view public gratitude" ON public_gratitude FOR SELECT USING (true);
CREATE POLICY "Users can insert gratitude" ON public_gratitude FOR INSERT WITH CHECK (true);

-- Insert sample objectives (manually managed by admins)
INSERT INTO care_objectives (user_id, username, title, description, category, points, status, completed_at, verified_at) VALUES
('user_alice', 'alice_wellness', 'Onboard 5 New Members', 'Help 5 new community members get started with their wellness journey and complete their first check-in', 'mentorship', 100, 'verified', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('user_bob', 'bob_mindful', 'Create Meditation Guide', 'Write a comprehensive guide for daily meditation practices for the community resource library', 'content', 75, 'verified', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours'),
('user_charlie', 'charlie_care', 'Weekly Support Sessions', 'Host weekly peer support sessions for community members struggling with consistency', 'support', 50, 'verified', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
('user_alice', 'alice_wellness', 'Community Wellness Workshop', 'Organize and facilitate a virtual wellness workshop for the community', 'events', 125, 'completed', NOW() - INTERVAL '6 hours', NULL),
('user_diana', 'diana_growth', 'Wellness Resource Curation', 'Curate a comprehensive collection of wellness resources and tools for community members', 'content', 75, 'active', NULL, NULL),
('user_eve', 'eve_mentor', 'Peer Mentorship Program', 'Mentor 3 community members through their first month of GOOD CARE practices', 'mentorship', 100, 'assigned', NULL, NULL);

-- Insert sample public gratitude
INSERT INTO public_gratitude (user_id, username, gratitude, mood) VALUES
('user_alice', 'alice_wellness', 'Grateful for this supportive community and the daily check-ins that keep me motivated on my wellness journey!', '😊'),
('user_bob', 'bob_mindful', 'Thankful for the opportunity to share my meditation practice with others and see the positive impact', '🙏'),
('user_charlie', 'charlie_care', 'Appreciating the small moments of peace in my daily routine and the community support that makes it possible', '😌'),
('user_diana', 'diana_growth', 'Feeling blessed to contribute to this amazing community and help others on their wellness path', '💚');
