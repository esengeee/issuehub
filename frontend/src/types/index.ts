export interface User {
  id: number
  name: string
  email: string
}

export interface Project {
  id: number
  name: string
  key: string
  description: string | null
  start_date: string | null
  created_at: string
}

export interface Issue {
  id: number
  project_id: number
  title: string
  description: string | null
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  reporter_id: number
  assignee_id: number | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  issue_id: number
  author_id: number
  body: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface IssueFilters {
  q?: string
  status?: Issue['status']
  priority?: Issue['priority']
  assignee?: number
  sort?: 'created_at' | 'updated_at' | 'priority' | 'status'
}
