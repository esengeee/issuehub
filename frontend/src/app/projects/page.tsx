'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { projectsAPI } from '@/lib/api'
import type { Project } from '@/types'
import Navbar from '@/components/Navbar'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadProjects()
  }, [user, router])

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.list()
      setProjects(response.data)
    } catch (err) {
      console.error('Failed to load projects', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await projectsAPI.create({ name, key, description })
      setShowCreateModal(false)
      setName('')
      setKey('')
      setDescription('')
      loadProjects()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project')
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading projects...</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Your Projects</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <h3>{project.name}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                  {project.key}
                </p>
                {project.description && (
                  <p style={{ marginTop: '10px', fontSize: '14px' }}>
                    {project.description}
                  </p>
                )}
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
              <h2 style={{ marginBottom: '20px' }}>Create New Project</h2>
              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <label htmlFor="name">Project Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="key">Project Key</label>
                  <input
                    id="key"
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g., PROJ"
                  />
                  <small style={{ color: '#666' }}>
                    A short unique identifier (e.g., PROJ, BUG)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (optional)</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {error && <div className="error">{error}</div>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">
                    Create Project
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
      </div>
    </>
  )
}
