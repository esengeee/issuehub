'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { issuesAPI, commentsAPI, projectsAPI } from '@/lib/api'
import type { Issue, Comment } from '@/types'
import Navbar from '@/components/Navbar'

export default function IssueDetailPage() {
  const [issue, setIssue] = useState<Issue | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [members, setMembers] = useState<Array<{ id: number; name: string; email: string; role: string }>>([])
  const [loading, setLoading] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [error, setError] = useState('')

  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const issueId = parseInt(params.id as string)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadIssue()
    loadComments()
  }, [user, router, issueId])

  const loadIssue = async () => {
    try {
      const response = await issuesAPI.get(issueId)
      setIssue(response.data)

      // Load project members
      const membersResponse = await projectsAPI.getMembers(response.data.project_id)
      setMembers(membersResponse.data)
    } catch (err) {
      console.error('Failed to load issue', err)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const response = await commentsAPI.list(issueId)
      setComments(response.data)
    } catch (err) {
      console.error('Failed to load comments', err)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!commentBody.trim()) return

    try {
      await commentsAPI.create(issueId, { body: commentBody })
      setCommentBody('')
      loadComments()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add comment')
    }
  }

  const handleStatusChange = async (status: string) => {
    try {
      await issuesAPI.update(issueId, { status: status as any })
      loadIssue()
    } catch (err: any) {
      alert('Failed to update status')
    }
  }

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      await issuesAPI.update(issueId, {
        assignee_id: assigneeId === '' ? null : parseInt(assigneeId)
      })
      loadIssue()
    } catch (err: any) {
      alert('Failed to update assignee')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading...</div>
      </>
    )
  }

  if (!issue) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card">Issue not found</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <button
          className="btn btn-secondary"
          onClick={() => router.push(`/projects/${issue.project_id}`)}
          style={{ marginBottom: '20px' }}
        >
          ← Back to Project
        </button>

        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ marginBottom: '10px' }}>{issue.title}</h1>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
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
            </div>

            {issue.description && (
              <p style={{ color: '#666', marginBottom: '15px' }}>{issue.description}</p>
            )}

            <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              <p>Created: {formatDate(issue.created_at)}</p>
              <p>Last updated: {formatDate(issue.updated_at)}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                  Status
                </label>
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                  Assigned To
                </label>
                <select
                  value={issue.assignee_id || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px', minWidth: '200px' }}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Comments ({comments.length})</h2>

          <div style={{ marginBottom: '20px' }}>
            {comments.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      borderLeft: '3px solid #0070f3',
                      paddingLeft: '15px',
                      marginBottom: '15px',
                      paddingBottom: '15px',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <p style={{ marginBottom: '10px' }}>{comment.body}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleAddComment}>
            <div className="form-group">
              <label htmlFor="comment">Add a comment</label>
              <textarea
                id="comment"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={4}
                placeholder="Write your comment here..."
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn btn-primary">
              Add Comment
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
