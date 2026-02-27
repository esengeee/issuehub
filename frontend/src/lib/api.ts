import axios from 'axios'
import type {
  User,
  Project,
  Issue,
  Comment,
  LoginRequest,
  SignupRequest,
  TokenResponse,
  IssueFilters,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  signup: (data: SignupRequest) =>
    api.post<TokenResponse>('/auth/signup', data),
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data),
  getMe: () => api.get<User>('/auth/me'),
}

// Projects API
export const projectsAPI = {
  list: () => api.get<Project[]>('/projects'),
  get: (id: number) => api.get<Project>(`/projects/${id}`),
  create: (data: { name: string; key: string; description?: string; start_date?: string }) =>
    api.post<Project>('/projects', data),
  addMember: (projectId: number, data: { email: string; role: string }) =>
    api.post(`/projects/${projectId}/members`, data),
  getMembers: (projectId: number) =>
    api.get<Array<{ id: number; name: string; email: string; role: string }>>(`/projects/${projectId}/members`),
}

// Issues API
export const issuesAPI = {
  list: (projectId: number, filters?: IssueFilters) =>
    api.get<Issue[]>(`/projects/${projectId}/issues`, { params: filters }),
  get: (id: number) => api.get<Issue>(`/issues/${id}`),
  create: (
    projectId: number,
    data: {
      title: string
      description?: string
      priority?: string
      assignee_id?: number
    }
  ) => api.post<Issue>(`/projects/${projectId}/issues`, data),
  update: (id: number, data: Partial<Issue>) =>
    api.patch<Issue>(`/issues/${id}`, data),
  delete: (id: number) => api.delete(`/issues/${id}`),
}

// Comments API
export const commentsAPI = {
  list: (issueId: number) =>
    api.get<Comment[]>(`/issues/${issueId}/comments`),
  create: (issueId: number, data: { body: string }) =>
    api.post<Comment>(`/issues/${issueId}/comments`, data),
}

export default api
