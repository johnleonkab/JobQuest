/**
 * Type definitions for CV Builder module
 */

export type CVSectionType =
  | "education"
  | "experience"
  | "certification"
  | "language"
  | "volunteering"
  | "project";

export interface CVEducation {
  id: string;
  user_id: string;
  institution: string;
  title: string;
  start_date: string;
  end_date: string | null;
  is_ongoing: boolean;
  notes: string | null;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface CVExperience {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface CVCertification {
  id: string;
  user_id: string;
  issuer: string;
  name: string;
  description: string | null;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface CVLanguage {
  id: string;
  user_id: string;
  language: string;
  level: string;
  certification_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CVVolunteering {
  id: string;
  user_id: string;
  organization: string;
  title: string;
  start_date: string;
  end_date: string | null;
  is_ongoing: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CVProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  links: string[];
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface CVData {
  education: CVEducation[];
  experience: CVExperience[];
  certifications: CVCertification[];
  languages: CVLanguage[];
  volunteering: CVVolunteering[];
  projects: CVProject[];
}

