import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../motionPresets'

const Badge = ({ children, color = 'blue' }) => {
  const map = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    gray: 'bg-gray-100 text-gray-700'
  }
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[color]}`}>{children}</span>
}

const statusColor = (status) => {
  if (status === 'Done') return 'green'
  if (status === 'In Progress') return 'blue'
  if (status === 'To Do') return 'yellow'
  return 'gray'
}

const Card = ({ _id, title, description, status, project, onToggleComplete, onInlineSave }) => {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState({ title: title || '', description: description || '' })

  React.useEffect(() => {
    setDraft({ title: title || '', description: description || '' })
  }, [title, description])

  const save = async () => {
    const payload = { title: draft.title.trim(), description: draft.description.trim() }
    await onInlineSave?.(_id, payload)
    setEditing(false)
  }

  return (
    <motion.div variants={fadeInUp} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow">
      <div className="h-40 w-full overflow-hidden rounded-xl bg-gray-200">
        <img src={`https://picsum.photos/seed/${encodeURIComponent(title)}/600/400`} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          {!editing ? (
            <>
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{description}</p>
              {project?.title ? (
                <p className="mt-1 text-xs text-gray-500">Project: {project.title}</p>
              ) : null}
            </>
          ) : (
            <div className="space-y-2">
              <input
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                value={draft.title}
                onChange={e => setDraft(v => ({ ...v, title: e.target.value }))}
                placeholder="Task title"
              />
              <textarea
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                rows={3}
                value={draft.description}
                onChange={e => setDraft(v => ({ ...v, description: e.target.value }))}
                placeholder="Task description"
              />
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={status === 'Done'}
                onChange={(e) => onToggleComplete?.(_id, e.target.checked)}
              />
              Done
            </label>
            <Badge color={statusColor(status)}>{status}</Badge>
          </div>
          {!editing ? (
            <button className="cursor-pointer rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={() => setEditing(true)}>Edit</button>
          ) : (
            <div className="flex items-center gap-2">
              <button className="cursor-pointer rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={() => { setEditing(false); setDraft({ title, description }) }}>Cancel</button>
              <button className="cursor-pointer rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600" onClick={save}>Save</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const FILTERS = ['All Tasks', 'To Do', 'In Progress', 'Done']
const SORT_OPTIONS = [
  { key: 'createdAt', label: 'Newest' },
  { key: 'createdAt-asc', label: 'Oldest' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'priority', label: 'Priority' },
  { key: 'progress', label: 'Progress' },
  { key: 'title', label: 'Title' },
]

const priorityRank = (p) => ({ Low: 1, Medium: 2, High: 3 }[p] || 0)

const Tasks = () => {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [activeFilter, setActiveFilter] = useState('All Tasks')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/tasks', { withCredentials: true })
        setTasks(res.data?.tasks || [])
      } catch (err) {
        if (err?.response?.status === 404) {
          setTasks([])
        } else {
          console.error('Error fetching tasks', err)
        }
      }
    }
    fetchTasks()
  }, [])

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (activeFilter === 'All Tasks') return true
      if (activeFilter === 'To Do') return t.status === 'To Do'
      if (activeFilter === 'In Progress') return t.status === 'In Progress'
      if (activeFilter === 'Done') return t.status === 'Done'
      return true
    })

    const [key, forcedDir] = sortKey.split('-')
    const dir = forcedDir === 'asc' ? 'asc' : sortDir
    const sign = dir === 'asc' ? 1 : -1

    const sorted = [...filtered].sort((a, b) => {
      if (key === 'createdAt') {
        return sign * (new Date(a.createdAt) - new Date(b.createdAt))
      }
      if (key === 'dueDate') {
        const aD = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const bD = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        return sign * (aD - bD)
      }
      if (key === 'priority') {
        return sign * (priorityRank(a.priority) - priorityRank(b.priority))
      }
      if (key === 'progress') {
        return sign * ((a.progress || 0) - (b.progress || 0))
      }
      if (key === 'title') {
        return sign * a.title.localeCompare(b.title)
      }
      return 0
    })

    return sorted
  }, [tasks, activeFilter, sortKey, sortDir])

  const toggleComplete = async (id, checked) => {
    try {
      const payload = checked
        ? { status: 'Done', progress: 100 }
        : { status: 'In Progress', progress: 0 }

      const res = await axios.put(`http://localhost:3000/api/tasks/${id}`,
        payload,
        { withCredentials: true }
      )
      const updated = res.data?.task
      setTasks(prev => prev.map(t => t._id === id ? updated : t))
    } catch (err) {
      console.error('Failed to toggle completion', err)
      alert('Failed to update task')
    }
  }

  return (
    <motion.main variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-7xl px-3 sm:px-4 pb-20 pt-4 sm:pb-12 sm:pt-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Tasks</h1>
        <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} onClick={() => navigate('/tasks/createTask')} className="rounded-lg cursor-pointer bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">+ New Task</motion.button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${activeFilter === f ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
          >
            {f}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <span>Sort by</span>
          <select
            className="rounded border border-gray-200 p-1.5 bg-white"
            value={sortKey}
            onChange={(e) => {
              const val = e.target.value
              if (val === 'createdAt-asc') {
                setSortKey('createdAt-asc')
              } else {
                setSortKey(val)
              }
            }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          {sortKey.includes('createdAt-asc') ? null : (
            <button
              className="rounded cursor-pointer border border-gray-200 px-2 py-1 hover:bg-gray-100"
              title={`Direction: ${sortDir === 'asc' ? 'Ascending' : 'Descending'}`}
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <motion.div variants={staggerContainer} className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTasks.map((t) => (
          <Card
            key={t._id}
            {...t}
            onToggleComplete={toggleComplete}
            onInlineSave={async (id, payload) => {
              try {
                const res = await axios.put(`http://localhost:3000/api/tasks/${id}`, payload, { withCredentials: true })
                const updated = res.data?.task
                setTasks(prev => prev.map(task => task._id === id ? updated : task))
              } catch (err) {
                console.error('Failed to save task', err)
                alert('Failed to save task')
              }
            }}
          />
        ))}
      </motion.div>
    </motion.main>
  )
}

export default Tasks