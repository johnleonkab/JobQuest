export type InterviewType = "phone" | "video" | "in-person" | "other";

export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export interface Interview {
  id: string;
  job_offer_id: string;
  user_id: string;
  title: string;
  scheduled_at: string; // ISO datetime string
  notes?: string;
  location?: string;
  interview_type?: InterviewType;
  status: InterviewStatus;
  created_at: string;
  updated_at: string;
}

export interface InterviewFormData {
  title: string;
  scheduled_at: Date;
  notes?: string;
  location?: string;
  interview_type?: InterviewType;
  status?: InterviewStatus;
}

