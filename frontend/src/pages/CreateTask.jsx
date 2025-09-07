import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../motionPresets'

const inputBase = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
const labelBase = 'block text-sm font-medium text-gray-700'
const sectionBox = 'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm'

const CreateTask = () => {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    startDate: today,
    dueDate: '',
    priority: 'Medium',
    progress: 0,
    project: '',
    assignee: ''
  })

  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return alert('Title is required')
    if (!/^[a-fA-F0-9]{24}$/.test(formData.project.trim())) return alert('Valid Project ID is required')

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      status: formData.status,
      startDate: formData.startDate || undefined,
      dueDate: formData.dueDate || undefined,
      priority: formData.priority,
      progress: Number(formData.progress) || 0,
      project: formData.project.trim(),
      assignee: /^[a-fA-F0-9]{24}$/.test(formData.assignee.trim()) ? formData.assignee.trim() : undefined
    }

    try {
      setSubmitting(true)
      await axios.post('http://localhost:3000/api/tasks', payload, {
        withCredentials: true
      })
      navigate('/tasks')
    } catch (err) {
      console.error('Failed to create task', err)
      alert(err?.response?.data?.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.main variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Create Task</h1>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/tasks')}
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
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelBase}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${inputBase} min-h-[100px]`}
              placeholder="Short description"
            />
          </div>

          <div>
            <label className={labelBase}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputBase}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
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
            <label className={labelBase}>Start Date</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputBase} />
          </div>

          <div>
            <label className={labelBase}>Due Date</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputBase} />
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

          <div>
            <label className={labelBase}>Project ID</label>
            <input
              name="project"
              value={formData.project}
              onChange={handleChange}
              className={inputBase}
              placeholder="Mongo ObjectId of project"
              required
            />
          </div>

          <div>
            <label className={labelBase}>Assignee User ID (optional)</label>
            <input
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              className={inputBase}
              placeholder="Mongo ObjectId of user"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/tasks')}
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
            {submitting ? 'Saving...' : '+ Save Task'}
          </motion.button>
        </div>
      </motion.form>
    </motion.main>
  )
}

export default CreateTask