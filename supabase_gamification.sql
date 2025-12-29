-- Gamification System Tables
-- Run this in your Supabase SQL Editor after supabase_setup.sql

-- Table to track user events (for XP and badge verification)
CREATE TABLE IF NOT EXISTS user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_id ON user_events(event_id);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);

-- Table to track earned badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, badge_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Enable Row Level Security
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for user_events
CREATE POLICY "Users can view own events"
  ON user_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_badges
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update user XP and level when an event occurs
CREATE OR REPLACE FUNCTION public.update_user_xp_and_level()
RETURNS TRIGGER AS $$
DECLARE
  total_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Calculate total XP for user
  SELECT COALESCE(SUM(xp_earned), 0) INTO total_xp
  FROM user_events
  WHERE user_id = NEW.user_id;

  -- Determine level based on XP (simplified - will be calculated in app)
  -- Level 1: 0-199, Level 2: 200-499, Level 3: 500-899, etc.
  new_level := CASE
    WHEN total_xp >= 8000 THEN 8
    WHEN total_xp >= 5000 THEN 7
    WHEN total_xp >= 3500 THEN 6
    WHEN total_xp >= 2000 THEN 5
    WHEN total_xp >= 900 THEN 4
    WHEN total_xp >= 500 THEN 3
    WHEN total_xp >= 200 THEN 2
    ELSE 1
  END;

  -- Update profile with new XP and level
  UPDATE profiles
  SET 
    xp = total_xp,
    level = new_level,
    updated_at = TIMEZONE('utc', NOW())
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update XP and level when event is inserted
DROP TRIGGER IF EXISTS on_user_event_inserted ON user_events;
CREATE TRIGGER on_user_event_inserted
  AFTER INSERT ON user_events
  FOR EACH ROW EXECUTE FUNCTION public.update_user_xp_and_level();

