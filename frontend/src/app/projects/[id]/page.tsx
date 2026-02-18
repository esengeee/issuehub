'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { projectsAPI, issuesAPI } from '@/lib/api'
import type { Project, Issue, IssueFilters } from '@/types'
import Navbar from '@/components/Navbar'

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Array<{ id: number; name: string; email: string; role: string }>>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined)
  const [error, setError] = useState('')

  // Add member form
  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState<'member' | 'maintainer'>('member')
  const [memberError, setMemberError] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'priority' | 'status'>('created_at')

  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = parseInt(params.id as string)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadProject()
    loadIssues()
  }, [user, router, projectId])

  useEffect(() => {
    loadIssues()
  }, [searchQuery, statusFilter, priorityFilter, sortBy])

  const loadProject = async () => {
    try {
      const response = await projectsAPI.get(projectId)
      setProject(response.data)

      // Load project members
      const membersResponse = await projectsAPI.getMembers(projectId)
      setMembers(membersResponse.data)
    } catch (err) {
      console.error('Failed to load project', err)
    }
  }

  const loadIssues = async () => {
    try {
      const filters: IssueFilters = {
        sort: sortBy,
      }
      if (searchQuery) filters.q = searchQuery
      if (statusFilter) filters.status = statusFilter as any
      if (priorityFilter) filters.priority = priorityFilter as any

      const response = await issuesAPI.list(projectId, filters)
      setIssues(response.data)
    } catch (err) {
      console.error('Failed to load issues', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await issuesAPI.create(projectId, {
        title,
        description,
        priority,
        assignee_id: assigneeId || undefined
      })
      setShowCreateModal(false)
      setTitle('')
      setDescription('')
      setPriority('medium')
      setAssigneeId(undefined)
      loadIssues()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create issue')
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setMemberError('')

    try {
      await projectsAPI.addMember(projectId, { email: memberEmail, role: memberRole })
      setShowAddMemberModal(false)
      setMemberEmail('')
      setMemberRole('member')
      alert('Member added successfully!')
    } catch (err: any) {
      setMemberError(err.response?.data?.detail || 'Failed to add member')
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#9c27b0',
    }
    return colors[priority] || '#666'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#2196f3',
      in_progress: '#ff9800',
      resolved: '#4caf50',
      closed: '#666',
    }
    return colors[status] || '#666'
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading...</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <h2>{project?.name}</h2>
          <p style={{ color: '#666' }}>{project?.key}</p>
          {project?.description && <p style={{ marginTop: '10px' }}>{project.description}</p>}
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="created_at">Newest First</option>
              <option value="updated_at">Recently Updated</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>

            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + New Issue
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowAddMemberModal(true)}
            >
              + Add Member
            </button>
          </div>
        </div>

        {issues.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No issues found. Create your first issue!</p>
          </div>
        ) : (
          <div>
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/issues/${issue.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '5px' }}>{issue.title}</h3>
                    {issue.description && (
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                        {issue.description.substring(0, 100)}
                        {issue.description.length > 100 && '...'}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: getStatusColor(issue.status),
                          color: 'white',
                        }}
                      >
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: getPriorityColor(issue.priority),
                          color: 'white',
                        }}
                      >
                        {issue.priority}
                      </span>
                      {issue.assignee_id && (
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: '#f5f5f5',
                            color: '#333',
                            border: '1px solid #ddd',
                          }}
                        >
                          👤 {members.find(m => m.id === issue.assignee_id)?.name || 'Assigned'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="card"
              style={{ maxWidth: '500px', width: '100%', margin: '20px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px' }}>Create New Issue</h2>
              <form onSubmit={handleCreateIssue}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assignee">Assign To (Optional)</label>
                  <select
                    id="assignee"
                    value={assigneeId || ''}
                    onChange={(e) => setAssigneeId(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                {error && <div className="error">{error}</div>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">
                    Create Issue
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddMemberModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowAddMemberModal(false)}
          >
            <div
              className="card"
              style={{ maxWidth: '500px', width: '100%', margin: '20px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px' }}>Add Member to Project</h2>
              <form onSubmit={handleAddMember}>
                <div className="form-group">
                  <label htmlFor="memberEmail">Email Address</label>
                  <input
                    id="memberEmail"
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    autoFocus
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    The user must already have an account
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="memberRole">Role</label>
                  <select
                    id="memberRole"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value as 'member' | 'maintainer')}
                  >
                    <option value="member">Member</option>
                    <option value="maintainer">Maintainer</option>
                  </select>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Members can create issues. Maintainers have full project access.
                  </p>
                </div>

                {memberError && <div className="error">{memberError}</div>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">
                    Add Member
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddMemberModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
