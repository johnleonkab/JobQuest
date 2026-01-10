export type ContactChannelType = "email" | "linkedin" | "phone" | "whatsapp" | "other";

export interface ContactChannel {
  type: ContactChannelType;
  value: string;
}

export interface JobOfferContact {
  id: string;
  job_offer_id: string;
  user_id: string;
  name: string;
  email?: string;
  role?: string;
  contact_channels: ContactChannel[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  email?: string;
  role?: string;
  contact_channels: ContactChannel[];
  notes?: string;
}


