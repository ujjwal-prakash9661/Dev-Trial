import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { fadeInUp, staggerContainer } from '../motionPresets'
import { motion } from 'framer-motion'

const AvatarGroup = ({ members = [] }) => {
  const visible = members.slice(0, 5)
  const extra = members.length - visible.length
  return (
    <div className="flex -space-x-2">
      {visible.map(m => (
        <img
          key={m._id}
          className="h-8 w-8 rounded-full ring-2 ring-white"
          src={m.avatarUrl || `https://i.pravatar.cc/64?u=${m._id}`}
          alt={m.username || 'member'}
          title={m.username || ''}
        />
      ))}
      {extra > 0 && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-700 ring-2 ring-white">+{extra}</span>
      )}
    </div>
  )
}

const Chip = ({ children }) => (
  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{children}</span>
)

const TeamCard = ({ team, allProjects, onSave }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    name: team.name || '',
    description: team.description || '',
    members: (team.members || []).map(m => m._id),
    projects: (team.projects || []).map(p => p._id)
  })

  useEffect(() => {
    setDraft({
      name: team.name || '',
      description: team.description || '',
      members: (team.members || []).map(m => m._id),
      projects: (team.projects || []).map(p => p._id)
    })
  }, [team])

  const toggleProject = (id) => {
    setDraft(prev => ({
      ...prev,
      projects: prev.projects.includes(id) ? prev.projects.filter(p => p !== id) : [...prev.projects, id]
    }))
  }

  const [membersInput, setMembersInput] = useState('')
  useEffect(() => {
    setMembersInput(draft.members.join(', '))
  }, [editing])

  const save = async () => {
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      members: membersInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      projects: draft.projects
    }
    await onSave(team._id, payload)
    setEditing(false)
  }

  return (
    <motion.div variants={fadeInUp} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {!editing ? (
            <>
              <h3 className="truncate text-lg font-semibold text-gray-900">{team.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{team.description || 'No description'}</p>
            </>
          ) : (
            <div className="space-y-2">
              <input
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                value={draft.name}
                onChange={e => setDraft(v => ({ ...v, name: e.target.value }))}
                placeholder="Team name"
              />
              <textarea
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                rows={3}
                value={draft.description}
                onChange={e => setDraft(v => ({ ...v, description: e.target.value }))}
                placeholder="Description"
              />
            </div>
          )}
        </div>
        <div className="shrink-0 text-right text-sm text-gray-600">
          <div>{team.members?.length || 0} members</div>
          <div>{team.projects?.length || 0} projects</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <AvatarGroup members={team.members || []} />
        <div className="flex items-center gap-2">
          {(team.projects || []).slice(0, 3).map(p => (
            <Chip key={p._id}>{p.title || 'Project'}</Chip>
          ))}
          {team.projects?.length > 3 && <Chip>+{team.projects.length - 3}</Chip>}
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">Members (comma-separated user IDs)</label>
            <input
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              value={membersInput}
              onChange={e => setMembersInput(e.target.value)}
              placeholder="665abc..., 665def..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Projects</label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {allProjects.map(p => (
                <label key={p._id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={draft.projects.includes(p._id)}
                    onChange={() => toggleProject(p._id)}
                  />
                  {p.title}
                </label>
              ))}
              {allProjects.length === 0 && (
                <div className="text-sm text-gray-500">No projects</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        {!editing ? (
          <button
            className="cursor-pointer rounded border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={() => setEditing(true)}
          >Edit</button>
        ) : (
          <>
            <button
              className="cursor-pointer rounded border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={() => { setEditing(false); setDraft({
                name: team.name || '',
                description: team.description || '',
                members: (team.members || []).map(m => m._id),
                projects: (team.projects || []).map(p => p._id)
              }) }}
            >Cancel</button>
            <button
              className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
              onClick={save}
            >Save</button>
          </>
        )}
      </div>
    </motion.div>
  )
}

const Teams = () => {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          axios.get('https://dev-trial-1.onrender.com/api/teams', { withCredentials: true }),
          axios.get('https://dev-trial-1.onrender.com/api/projects', { withCredentials: true })
        ])
        setTeams(tRes.data?.teams || [])
        setProjects(pRes.data?.projects || [])
        setError('')
      } catch (err) {
        if (err?.response?.status === 404) {
          setTeams([])
        } else {
          setError('Failed to load teams')
          console.error('Error fetching teams', err)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const saveTeam = async (id, payload) => {
    const res = await axios.put(`https://dev-trial-1.onrender.com/api/teams/${id}`, payload, { withCredentials: true })
    const updated = res.data?.team
    setTeams(prev => prev.map(t => t._id === id ? updated : t))
  }

  return (
    <motion.main variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-7xl px-3 sm:px-4 pb-20 pt-4 sm:pb-12 sm:pt-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Teams</h1>
        <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} onClick={() => navigate('/teams/createTeam')} className="rounded-lg cursor-pointer bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">+ New Team</motion.button>
      </div>

      {loading ? (
        <div className="mt-10 text-gray-600">Loading...</div>
      ) : error ? (
        <div className="mt-10 text-red-600">{error}</div>
      ) : teams.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed p-8 text-center text-gray-600">
          No teams yet. Create your first team.
        </div>
      ) : (
        <motion.div variants={staggerContainer} className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <TeamCard key={t._id} team={t} allProjects={projects} onSave={saveTeam} />
          ))}
        </motion.div>
      )}
    </motion.main>
  )
}

export default Teams