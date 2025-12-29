export type JobOfferStatus =
  | "saved"
  | "contacted"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "accepted";

export type JobType = "full-time" | "part-time" | "contract" | "internship";

export interface SelectedCVSections {
  experience?: string[];
  education?: string[];
  certifications?: string[];
  languages?: string[];
  volunteering?: string[];
  projects?: string[];
}

export interface JobOffer {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  job_description?: string;
  status: JobOfferStatus;
  salary_range_min?: number;
  salary_range_max?: number;
  job_type?: JobType;
  tags: string[];
  notes?: string;
  company_logo_url?: string;
  company_website?: string;
  application_date?: string;
  interview_date?: string;
  offer_date?: string;
  selected_cv_sections?: SelectedCVSections;
  created_at: string;
  updated_at: string;
}

export interface JobOfferStats {
  active: number;
  interviews: number;
  responseRate: number;
  weeklyStreak: number;
}

