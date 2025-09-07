import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../motionPresets'

const StatCard = ({ label, value }) => (
  <motion.div variants={fadeInUp} className="rounded-xl border border-gray-200 bg-white p-5">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="mt-2 text-3xl font-bold">{value}</div>
  </motion.div>
)

const Row = ({ name, status, due, progress }) => (
  <motion.div variants={fadeInUp} className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-4 py-3 last:border-none">
    <div className="col-span-5 text-sm font-medium text-gray-800">{name}</div>
    <div className="col-span-2">
      <span className={`rounded-full flex flex-col items-center justify-self-start px-3 py-1 text-xs font-medium ${
        status === 'Completed' ? 'bg-green-100 text-green-700' :
        status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
        'bg-yellow-100 text-yellow-700'}`}>{status}</span>
    </div>
    <div className="col-span-2 text-sm text-gray-600">{due}</div>
    <div className="col-span-3">
      <div className="h-2 rounded-full bg-gray-200">
        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  </motion.div>
)

// Helpers to safely map API data
const formatDate = (dateLike) => {
  if (!dateLike) return '-'
  const d = new Date(dateLike)
  if (isNaN(d)) return '-'
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

const normalizeStatus = (value) => {
  const s = (value || '').toString().toLowerCase()
  if (s.includes('complete')) return 'Completed'
  if (s.includes('progress') || s.includes('active')) return 'In Progress'
  if (s.includes('hold') || s.includes('pending')) return 'On Hold'
  return 'In Progress'
}

const computeProgress = (project) => {
  if (typeof project?.progress === 'number') {
    return Math.max(0, Math.min(100, Math.round(project.progress)))
  }
  const tasks = project?.tasks || []
  const total = tasks.length
  if (!total) return 0
  const completed = tasks.filter(t => (t?.status || '').toString().toLowerCase().includes('complete')).length
  return Math.round((completed / total) * 100)
}

const Dashboard = () => {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ totalProjects: 0, activeTasks: 0, teamMembers: 0 })

  useEffect(() => {
    const controller = new AbortController()
    const base = import.meta?.env?.VITE_API_URL || 'http://localhost:3000'

    const fetchAll = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          axios.get(`${base}/api/projects`, { withCredentials: true, signal: controller.signal }),
          axios.get(`${base}/api/tasks`, { withCredentials: true, signal: controller.signal })
        ])

        const rawProjects = Array.isArray(projRes.data) ? projRes.data : (projRes.data?.projects || [])
        const projData = [...rawProjects].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
        setProjects(projData)

        const rawTasks = Array.isArray(taskRes.data) ? taskRes.data : (taskRes.data?.tasks || [])
        setTasks(rawTasks)

        const totalProjects = projData.length
        const activeTasks = rawTasks.filter(t => (t?.status || '') !== 'Done').length

        const teamMembersSet = new Set()
        projData.forEach(p => {
          const members = p?.teamMembers || []
          members.forEach(m => teamMembersSet.add(m?._id || m?.id || m))
        })
        if (teamMembersSet.size === 0) {
          rawTasks.forEach(t => {
            const a = t?.assignee
            if (a) teamMembersSet.add(a?._id || a?.id || a)
          })
        }

        setStats({ totalProjects, activeTasks, teamMembers: teamMembersSet.size })
      } catch (err) {
        if (err?.name !== 'CanceledError') {
          setError('Failed to load dashboard data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
    return () => controller.abort()
  }, [])

  const upcomingTasks = useMemo(() => {
    const now = new Date()
    return tasks
      .filter(t => t?.dueDate && new Date(t.dueDate).getTime() >= now.getTime() && (t?.status || '') !== 'Done')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3)
  }, [tasks])

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full p-3 sm:p-4 pb-20 sm:pb-10">
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-gray-600">Welcome back!</p>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} onClick={() => navigate('/projects/createProject')} className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">New Project</motion.button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Projects" value={loading ? '...' : stats.totalProjects} />
        <StatCard label="Active Tasks" value={loading ? '...' : stats.activeTasks} />
        <StatCard label="Team Members" value={loading ? '...' : stats.teamMembers} />
      </div>

      {/* Recent Projects */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Recent Projects</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">
            <div className="col-span-5">PROJECT NAME</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-2">DUE DATE</div>
            <div className="col-span-3">PROGRESS</div>
          </div>
          <div className="divide-y">
            {error && (
              <div className="p-4 text-sm text-red-600">{error}</div>
            )}
            {loading && !error && (
              <div className="p-4 text-sm text-gray-500">Loading projects...</div>
            )}
            {!loading && !error && projects.slice(0, 3).map((p, idx) => (
              <Row
                key={p?._id || p?.id || idx}
                name={p?.name || p?.title || 'Untitled Project'}
                status={normalizeStatus(p?.status)}
                due={formatDate(p?.dueDate || p?.deadline || p?.due)}
                progress={computeProgress(p)}
              />
            ))}
            {!loading && !error && projects.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No projects found.</div>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Tasks */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Upcoming Tasks</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">
            <div className="col-span-5">TASK NAME</div>
            <div className="col-span-3">PROJECT</div>
            <div className="col-span-2">DUE DATE</div>
            <div className="col-span-2">ASSIGNEE</div>
          </div>
          <div className="divide-y">
            {loading && (
              <div className="p-4 text-sm text-gray-500">Loading tasks...</div>
            )}
            {!loading && upcomingTasks.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No upcoming tasks.</div>
            )}
            {!loading && upcomingTasks.map((t, i) => (
              <motion.div variants={fadeInUp} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm" key={t?._id || i}>
                <div className="col-span-5">{t?.title || 'Untitled Task'}</div>
                <div className="col-span-3">{t?.project?.title || '-'}</div>
                <div className="col-span-2">{formatDate(t?.dueDate)}</div>
                <div className="col-span-2">{t?.assignee?.username || '-'}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  )
}

export default Dashboard