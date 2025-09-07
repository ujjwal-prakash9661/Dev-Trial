import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CreateTeam = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projects, setProjects] = useState([])
  const [selectedProjects, setSelectedProjects] = useState([])
  const [membersInput, setMembersInput] = useState('') // comma-separated user IDs
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load available projects for selection
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await axios.get('https://dev-trial-7mpp.onrender.com/api/projects', { withCredentials: true })
        setProjects(res.data?.projects || [])
      } catch (e) {
        console.error('Failed to load projects', e)
      }
    }
    loadProjects()
  }, [])

  const toggleProject = (id) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        name,
        description: description || undefined,
        members: membersInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        projects: selectedProjects,
      }

      await axios.post('https://dev-trial-7mpp.onrender.com/api/teams', payload, { withCredentials: true })
      navigate('/teams')
    } catch (err) {
      console.error('Create team failed', err)
      setError(err?.response?.data?.message || 'Failed to create team')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar brand="TeamFlow" />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Create Team</h1>

        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 w-full rounded border border-gray-300 p-2"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this team about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Projects</label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {projects.map((p) => (
                <label key={p._id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(p._id)}
                    onChange={() => toggleProject(p._id)}
                  />
                  {p.title}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Members</label>
            <input
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={membersInput}
              onChange={(e) => setMembersInput(e.target.value)}
              placeholder="Comma-separated user IDs (ObjectIds)"
            />
            <p className="mt-1 text-xs text-gray-500">Example: 665abc..., 665def...</p>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-60"
            >
              {saving ? 'Creating...' : 'Create Team'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default CreateTeam