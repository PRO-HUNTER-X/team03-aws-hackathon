export interface User {
  email: string
  name: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Inquiry {
  id: string
  title: string
  content: string
  category: 'payment' | 'technical' | 'general'
  urgency: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
  ai_response?: string
  satisfaction_score?: number
}

export interface DashboardStats {
  total_inquiries: number
  pending_count: number
  in_progress_count: number
  completed_count: number
  avg_satisfaction: number
}