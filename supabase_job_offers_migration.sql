-- Migration: Add selected_cv_sections column to job_offers table
-- Run this if the column doesn't exist yet

-- Add column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'job_offers' 
    AND column_name = 'selected_cv_sections'
  ) THEN
    ALTER TABLE job_offers 
    ADD COLUMN selected_cv_sections JSONB DEFAULT '{}';
  END IF;
END $$;

