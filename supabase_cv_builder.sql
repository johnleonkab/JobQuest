-- CV Builder Database Schema
-- This script creates all necessary tables for the CV Builder module

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: cv_education
-- Stores education and academic training
CREATE TABLE IF NOT EXISTS cv_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT FALSE,
  notes TEXT,
  skills TEXT[], -- Array of skills/tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: cv_experience
-- Stores work experience
CREATE TABLE IF NOT EXISTS cv_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  skills TEXT[], -- Array of skills/tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: cv_certifications
-- Stores certifications and licenses
CREATE TABLE IF NOT EXISTS cv_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issuer TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  skills TEXT[], -- Array of skills/tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: cv_languages
-- Stores language proficiency
CREATE TABLE IF NOT EXISTS cv_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  certification_id UUID REFERENCES cv_certifications(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: cv_volunteering
-- Stores volunteer work
CREATE TABLE IF NOT EXISTS cv_volunteering (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: cv_projects
-- Stores personal projects
CREATE TABLE IF NOT EXISTS cv_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  links TEXT[], -- Array of URLs
  images TEXT[], -- Array of image URLs (stored in Supabase Storage)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE cv_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_volunteering ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_projects ENABLE ROW LEVEL SECURITY;

-- Policies for cv_education
CREATE POLICY "Users can view their own education"
  ON cv_education FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own education"
  ON cv_education FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education"
  ON cv_education FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education"
  ON cv_education FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for cv_experience
CREATE POLICY "Users can view their own experience"
  ON cv_experience FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experience"
  ON cv_experience FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experience"
  ON cv_experience FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experience"
  ON cv_experience FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for cv_certifications
CREATE POLICY "Users can view their own certifications"
  ON cv_certifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certifications"
  ON cv_certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certifications"
  ON cv_certifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certifications"
  ON cv_certifications FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for cv_languages
CREATE POLICY "Users can view their own languages"
  ON cv_languages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own languages"
  ON cv_languages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own languages"
  ON cv_languages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own languages"
  ON cv_languages FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for cv_volunteering
CREATE POLICY "Users can view their own volunteering"
  ON cv_volunteering FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own volunteering"
  ON cv_volunteering FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own volunteering"
  ON cv_volunteering FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own volunteering"
  ON cv_volunteering FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for cv_projects
CREATE POLICY "Users can view their own projects"
  ON cv_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON cv_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON cv_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON cv_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_cv_education_updated_at
  BEFORE UPDATE ON cv_education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_experience_updated_at
  BEFORE UPDATE ON cv_experience
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_certifications_updated_at
  BEFORE UPDATE ON cv_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_languages_updated_at
  BEFORE UPDATE ON cv_languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_volunteering_updated_at
  BEFORE UPDATE ON cv_volunteering
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_projects_updated_at
  BEFORE UPDATE ON cv_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-project-images', 'cv-project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project images
CREATE POLICY "Users can upload their own project images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cv-project-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own project images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cv-project-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own project images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cv-project-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

