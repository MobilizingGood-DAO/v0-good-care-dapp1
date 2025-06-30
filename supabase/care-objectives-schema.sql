-- Care Objectives Schema for GOOD CARE DApp
-- This creates the backend-managed objectives system

-- Create care_objectives table
CREATE TABLE IF NOT EXISTS care_objectives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('mentorship', 'content', 'support', 'events')),
    points INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    estimated_hours INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_objectives table to track user progress
CREATE TABLE IF NOT EXISTS user_objectives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    objective_id UUID NOT NULL REFERENCES care_objectives(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'verified')),
    evidence TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, objective_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_care_objectives_category ON care_objectives(category);
CREATE INDEX IF NOT EXISTS idx_care_objectives_points ON care_objectives(points);
CREATE INDEX IF NOT EXISTS idx_user_objectives_user_id ON user_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_user_objectives_status ON user_objectives(status);
CREATE INDEX IF NOT EXISTS idx_user_objectives_user_status ON user_objectives(user_id, status);

-- Enable RLS
ALTER TABLE care_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_objectives ENABLE ROW LEVEL SECURITY;

-- RLS Policies for care_objectives (read-only for users)
CREATE POLICY "Users can view all objectives" ON care_objectives
    FOR SELECT USING (true);

-- RLS Policies for user_objectives
CREATE POLICY "Users can view their own objectives" ON user_objectives
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives" ON user_objectives
    FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample care objectives (backend managed)
INSERT INTO care_objectives (title, description, category, points, difficulty, estimated_hours) VALUES
('Onboard 5 New Members', 'Help 5 new community members complete their first check-in and understand the platform', 'mentorship', 100, 'medium', 8),
('Create Meditation Guide', 'Write a comprehensive guide on daily meditation practices for the community', 'content', 75, 'medium', 6),
('Weekly Support Sessions', 'Host weekly peer support sessions for community members', 'support', 50, 'easy', 4),
('Community Wellness Workshop', 'Organize and facilitate a wellness workshop for the community', 'events', 125, 'hard', 12),
('Mental Health Resource Hub', 'Curate and organize mental health resources for community access', 'content', 80, 'medium', 7),
('Buddy System Program', 'Create and manage a buddy system pairing new and experienced members', 'mentorship', 90, 'medium', 10),
('Crisis Support Training', 'Complete training to provide crisis support to community members', 'support', 60, 'medium', 5),
('Gratitude Circle Event', 'Organize monthly gratitude sharing circles for the community', 'events', 70, 'easy', 3);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_care_objectives_updated_at BEFORE UPDATE ON care_objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_objectives_updated_at BEFORE UPDATE ON user_objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
