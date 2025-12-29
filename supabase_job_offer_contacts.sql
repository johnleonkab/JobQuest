-- Job Offer Contacts Database Schema
-- This script creates the job_offer_contacts table for storing contact persons

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: job_offer_contacts
-- Stores contact persons for job offers
CREATE TABLE IF NOT EXISTS job_offer_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_offer_id UUID NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT, -- e.g., "Recruiter", "HR Manager", "Hiring Manager"
  contact_channels JSONB DEFAULT '[]', -- Array of objects: [{"type": "email", "value": "email@example.com"}, {"type": "linkedin", "value": "linkedin.com/in/..."}, ...]
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_job_offer_contacts_job_offer_id ON job_offer_contacts(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_job_offer_contacts_user_id ON job_offer_contacts(user_id);

-- Row Level Security Policies
ALTER TABLE job_offer_contacts ENABLE ROW LEVEL SECURITY;

-- Users can view their own contacts
CREATE POLICY "Users can view their own contacts"
  ON job_offer_contacts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own contacts
CREATE POLICY "Users can insert their own contacts"
  ON job_offer_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own contacts
CREATE POLICY "Users can update their own contacts"
  ON job_offer_contacts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own contacts
CREATE POLICY "Users can delete their own contacts"
  ON job_offer_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_offer_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_offer_contacts_updated_at
  BEFORE UPDATE ON job_offer_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_job_offer_contacts_updated_at();

