// src/types/index.ts
export enum ClaimStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export interface StudentClaim {
  id: number;
  claim_type: string;
  subject: string;
  description: string;
  status: ClaimStatus;
  created_at: string;
  submitted_at?: string;
  updated_at: string;
  student: any;
  student_name?: string;
  attachments?: string[];
}

export interface ClaimResponse {
  id: number;
  claim: any;
  message: string;
  responder: any;
  responder_name?: string;
  created_at: string;
  response_text?: string;
  responded_at?: string;
  is_internal: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  success: boolean;
  data: T[];
  message: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  first_name: string;
  last_name: string;
}

export interface FilterOptions {
  status?: ClaimStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}