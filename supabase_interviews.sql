-- Interviews Database Schema
-- This script creates the interviews table for job offers

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: interviews
-- Stores interview appointments for job offers
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_offer_id UUID NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  location TEXT, -- Optional: physical location or video call link
  interview_type TEXT CHECK (interview_type IN ('phone', 'video', 'in-person', 'other')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_interviews_job_offer_id ON interviews(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Row Level Security Policies
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Users can view their own interviews
CREATE POLICY "Users can view their own interviews"
  ON interviews FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own interviews
CREATE POLICY "Users can insert their own interviews"
  ON interviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own interviews
CREATE POLICY "Users can update their own interviews"
  ON interviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own interviews
CREATE POLICY "Users can delete their own interviews"
  ON interviews FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_interviews_updated_at();

