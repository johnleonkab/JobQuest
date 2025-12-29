-- Job Offers Database Schema
-- This script creates all necessary tables for the Job Offers Kanban module

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: job_offers
-- Stores job offers and applications
CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  job_description TEXT,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'contacted', 'applied', 'interview', 'offer', 'rejected', 'accepted')),
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  company_logo_url TEXT,
  application_date DATE,
  interview_date DATE,
  offer_date DATE,
  selected_cv_sections JSONB DEFAULT '{}', -- { "experience": ["id1", "id2"], "education": ["id3"], ... }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_job_offers_user_id ON job_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_job_offers_created_at ON job_offers(created_at DESC);

-- Row Level Security Policies
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

-- Users can view their own job offers
CREATE POLICY "Users can view their own job offers"
  ON job_offers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own job offers
CREATE POLICY "Users can insert their own job offers"
  ON job_offers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own job offers
CREATE POLICY "Users can update their own job offers"
  ON job_offers FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own job offers
CREATE POLICY "Users can delete their own job offers"
  ON job_offers FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_job_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_job_offers_updated_at
  BEFORE UPDATE ON job_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_job_offers_updated_at();

