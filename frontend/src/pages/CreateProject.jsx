import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../motionPresets'

const inputBase = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
const labelBase = 'block text-sm font-medium text-gray-700'
const sectionBox = 'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm'

const CreateProject = () => {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    details: '',
    status: 'In Progress',
    color: 'blue',
    startDate: today,
    dueDate: '',
    priority: 'Medium',
    progress: 0,
    teamMembers: '',
    teams: []
  })

  const [availableTeams, setAvailableTeams] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await axios.get('https://dev-trial-1.onrender.com/api/teams', { withCredentials: true })
        setAvailableTeams(res.data?.teams || [])
      } catch (e) {
        if (e?.response?.status !== 404) console.error('Failed to load teams', e)
      }
    }
    loadTeams()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleTeam = (id) => {
    setFormData(prev => ({
      ...prev,
      teams: prev.teams.includes(id) ? prev.teams.filter(t => t !== id) : [...prev.teams, id]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return alert('Title is required')

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      details: formData.details.trim() || undefined,
      status: formData.status,
      color: formData.color,
      startDate: formData.startDate || undefined,
      dueDate: formData.dueDate || undefined,
      priority: formData.priority,
      progress: Number(formData.progress) || 0,
      teamMembers: formData.teamMembers
        ? formData.teamMembers
            .split(',')
            .map(s => s.trim())
            .filter(v => /^[a-fA-F0-9]{24}$/.test(v))
        : [],
      teams: formData.teams
    }

    try {
      setSubmitting(true)
      await axios.post('https://dev-trial-1.onrender.com/api/projects', payload, {
        withCredentials: true
      })
      navigate('/projects')
    } catch (err) {
      console.error('Failed to create project', err)
      alert('Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.main variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Create Project</h1>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/projects')}
          className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </motion.button>
      </div>

      <motion.form variants={fadeInUp} onSubmit={handleSubmit} className={sectionBox}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelBase}>Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={inputBase}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${inputBase} min-h-[80px]`}
              placeholder="Short description"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Details</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              className={`${inputBase} min-h-[120px]`}
              placeholder="Longer details or notes"
            />
          </div>

          <div>
            <label className={labelBase}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputBase}>
              <option>In Progress</option>
              <option>Completed</option>
              <option>On Hold</option>
              <option>Archived</option>
            </select>
          </div>

          <div>
            <label className={labelBase}>Color</label>
            <select name="color" value={formData.color} onChange={handleChange} className={inputBase}>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="gray">Gray</option>
            </select>
          </div>

          <div>
            <label className={labelBase}>Start Date</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Due Date</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className={inputBase}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className={labelBase}>Progress: {formData.progress}%</label>
            <input
              type="range"
              min="0"
              max="100"
              name="progress"
              value={formData.progress}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Team Members (comma-separated user IDs)</label>
            <input
              name="teamMembers"
              value={formData.teamMembers}
              onChange={handleChange}
              className={inputBase}
              placeholder="e.g. 665a..., 665b..., 665c..."
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Teams</label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {availableTeams.map(t => (
                <label key={t._id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.teams.includes(t._id)}
                    onChange={() => toggleTeam(t._id)}
                  />
                  {t.name}
                </label>
              ))}
              {availableTeams.length === 0 && (
                <div className="text-sm text-gray-500">No teams available</div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">If no team members are specified, members from selected teams will be used.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/projects')}
            className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            disabled={submitting}
            className="rounded-lg cursor-pointer bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : '+ Save Project'}
          </motion.button>
        </div>
      </motion.form>
    </motion.main>
  )
}

export default CreateProject