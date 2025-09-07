import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../motionPresets'

// ---- UI bits ----
const StatCard = ({ title, value, sub }) => (
  <motion.div variants={fadeInUp} className="rounded-2xl border border-gray-200 bg-white p-6">
    <div className="text-sm font-medium text-gray-500">{title}</div>
    <div className="mt-2 text-4xl font-semibold text-gray-900">{value}</div>
    {sub ? <div className="mt-1 text-xs text-gray-500">{sub}</div> : null}
  </motion.div>
)

// Simple SVG bar chart for compact use without external deps
const BarChart = ({ data, height = 180, barColor = '#3b82f6' }) => {
  const padding = 28
  const width = 420
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  const max = Math.max(1, ...data.map(d => d.value))
  const bw = innerW / Math.max(1, data.length)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
      {/* axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />
      {/* bars */}
      {data.map((d, i) => {
        const h = (d.value / max) * (innerH - 10)
        const x = padding + i * bw + bw * 0.15
        const y = height - padding - h
        const barW = bw * 0.7
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx="6" fill={barColor} />
            <text x={x + barW / 2} y={height - padding + 16} textAnchor="middle" fontSize="10" fill="#6b7280">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Stock-like smooth area chart (gradient, gridlines)
const AreaChart = ({ data, height = 200, stroke = '#2563eb', fillFrom = '#93c5fd', fillTo = 'rgba(147,197,253,0.05)' }) => {
  const padding = 28
  const width = 520
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  if (!data.length) {
    return (
      <div className="h-48 grid place-items-center text-sm text-gray-500">No data</div>
    )
  }

  const xs = data.map(d => (d.x instanceof Date ? d.x.getTime() : new Date(d.x).getTime()))
  const ys = data.map(d => d.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys, 0)
  const maxY = Math.max(...ys, 1)

  const xScale = (x) => {
    if (maxX === minX) return padding + innerW / 2
    return padding + ((x - minX) / (maxX - minX)) * innerW
  }
  const yScale = (y) => padding + innerH - ((y - minY) / (maxY - minY)) * innerH

  // Smooth path with cubic beziers
  const points = xs.map((x, i) => ({ x: xScale(x), y: yScale(ys[i]) }))
  const path = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = arr[i - 1]
    const cx1 = prev.x + (p.x - prev.x) / 2
    const cy1 = prev.y
    const cx2 = prev.x + (p.x - prev.x) / 2
    const cy2 = p.y
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`
  }, '')

  const area = `${path} L ${points[points.length - 1].x} ${padding + innerH} L ${points[0].x} ${padding + innerH} Z`

  // gridlines
  const gridY = 4
  const gridLines = Array.from({ length: gridY + 1 }, (_, i) => padding + (innerH / gridY) * i)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52">
      {gridLines.map((y, i) => (
        <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" />
      ))}

      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillFrom} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fillTo} stopOpacity="0" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#93c5fd" floodOpacity="0.25" />
        </filter>
      </defs>

      <path d={area} fill="url(#areaFill)" />
      <path d={path} stroke={stroke} strokeWidth="3" fill="none" filter="url(#softShadow)" />

      {/* last point dot */}
      {(() => {
        const p = points[points.length - 1]
        return <circle cx={p.x} cy={p.y} r="4" fill={stroke} />
      })()}
    </svg>
  )
}

// Simple SVG pie chart for compact use without external deps
const PieChart = ({ data, colors = ['#60a5fa', '#93c5fd', '#34d399', '#f87171'] }) => {
  const size = 200
  const cx = size / 2
  const cy = size / 2
  const r = 80
  const total = Math.max(1, data.reduce((s, d) => s + d.value, 0))

  let acc = 0
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2
    const x1 = cx + Math.cos(acc) * r
    const y1 = cy + Math.sin(acc) * r
    acc += angle
    const x2 = cx + Math.cos(acc) * r
    const y2 = cy + Math.sin(acc) * r
    const largeArc = angle > Math.PI ? 1 : 0
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    return { path, color: colors[i % colors.length], label: d.label, value: d.value }
  })

  return (
    <div className="flex items-center gap-6">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-48 w-48">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="1" />
        ))}
      </svg>
      <div className="space-y-2 text-sm">
        {slices.map((s, i) => (
          <div className="flex items-center gap-2" key={i}>
            <span className="inline-block h-3 w-3 rounded" style={{ background: s.color }} />
            <span className="text-gray-700">{s.label}</span>
            <span className="text-gray-400">— {s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Helpers ----
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1)
const endOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
const lastNDays = (n) => { const e = new Date(); const s = new Date(e); s.setDate(s.getDate() - n); return [s, e] }
const startOfYear = (d = new Date()) => new Date(d.getFullYear(), 0, 1)
const endOfYear = (d = new Date()) => new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)
const quarterOf = (d = new Date()) => Math.floor(d.getMonth() / 3)
const startOfQuarter = (d = new Date()) => new Date(d.getFullYear(), quarterOf(d) * 3, 1)
const endOfQuarter = (d = new Date()) => new Date(d.getFullYear(), quarterOf(d) * 3 + 3, 0, 23, 59, 59, 999)

const within = (dateLike, start, end) => {
  if (!dateLike) return false
  const t = new Date(dateLike).getTime()
  return t >= start.getTime() && t <= end.getTime()
}

const formatMonthYear = (dateLike) => {
  if (!dateLike) return '-'
  const d = new Date(dateLike)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const clampPercent = (n) => Math.max(0, Math.min(100, Math.round(n)))

const Report = () => {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const TIME_RANGES = ['This Month', 'Last 30 Days', 'This Quarter', 'This Year', 'All Time']
  const [timeRange, setTimeRange] = useState('This Month')
  const [projectId, setProjectId] = useState('all')

  // Fetch
  useEffect(() => {
    const controller = new AbortController()
    let mounted = true
    const base = import.meta?.env?.VITE_API_URL || 'http://localhost:3000'
    const run = async () => {
      try {
        const [p, t] = await Promise.all([
          axios.get(`${base}/api/projects`, { withCredentials: true, signal: controller.signal }),
          axios.get(`${base}/api/tasks`, { withCredentials: true, signal: controller.signal })
        ])
        if (!mounted) return
        setProjects(Array.isArray(p.data) ? p.data : (p.data?.projects || []))
        setTasks(Array.isArray(t.data) ? t.data : (t.data?.tasks || []))
      } catch (err) {
        // Ignore cancellation on unmount/navigation
        if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
          return
        }
        console.error('Failed to load reports data:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false; controller.abort() }
  }, [])

  // Time window
  const [start, end] = useMemo(() => {
    const now = new Date()
    if (timeRange === 'This Month') return [startOfMonth(now), endOfMonth(now)]
    if (timeRange === 'Last 30 Days') return lastNDays(30)
    if (timeRange === 'This Quarter') return [startOfQuarter(now), endOfQuarter(now)]
    if (timeRange === 'This Year') return [startOfYear(now), endOfYear(now)]
    return [new Date(0), new Date(8640000000000000)] // All time
  }, [timeRange])

  // Filter tasks by time range (use updatedAt if present; else dueDate; else createdAt)
  const filteredTasks = useMemo(() => {
    const list = tasks.filter(t => {
      const when = t?.updatedAt || t?.dueDate || t?.createdAt
      if (!within(when, start, end)) return false
      if (projectId !== 'all') return (t?.project?._id || t?.project) === projectId
      return true
    })
    return list
  }, [tasks, start, end, projectId])

  // Project options
  const projectOptions = useMemo(() => (
    [{ _id: 'all', title: 'All Projects' }, ...projects.map(p => ({ _id: p._id, title: p.title || 'Untitled' }))]
  ), [projects])

  // Stats
  const totalProjectsCompleted = useMemo(() => {
    const list = projectId === 'all' ? projects : projects.filter(p => p._id === projectId)
    return list.filter(p => p.status === 'Completed').length
  }, [projects, projectId])

  const tasksCompletedThisRange = useMemo(() => (
    filteredTasks.filter(t => t.status === 'Done').length
  ), [filteredTasks])

  const avgCompletionRate = useMemo(() => {
    if (filteredTasks.length === 0) return 0
    const done = filteredTasks.filter(t => t.status === 'Done').length
    return clampPercent((done / filteredTasks.length) * 100)
  }, [filteredTasks])

  const activeTeamMembers = useMemo(() => {
    const set = new Set()
    const sourceProjects = projectId === 'all' ? projects : projects.filter(p => p._id === projectId)
    sourceProjects.forEach(p => (p?.teamMembers || []).forEach(m => set.add(m?._id || m)))
    if (set.size === 0) filteredTasks.forEach(t => t?.assignee && set.add(t.assignee?._id || t.assignee))
    return set.size
  }, [projects, filteredTasks, projectId])

  // Charts
  const tasksPerProject = useMemo(() => {
    const byProj = new Map()
    filteredTasks.forEach(t => {
      const pid = t?.project?._id || t?.project
      const name = t?.project?.title || 'Unknown'
      if (!byProj.has(pid)) byProj.set(pid, { label: name, total: 0, done: 0 })
      const obj = byProj.get(pid)
      obj.total += 1
      if (t.status === 'Done') obj.done += 1
    })
    const arr = Array.from(byProj.values()).map(x => ({ label: x.label, value: x.done }))
    return arr.sort((a, b) => b.value - a.value).slice(0, 6)
  }, [filteredTasks])

  // Line/area series: cumulative completed tasks over time (stock-like)
  const completionSeries = useMemo(() => {
    // group by day for tasks marked Done (use updatedAt as completion proxy)
    const map = new Map()
    filteredTasks.forEach(t => {
      if (t.status !== 'Done') return
      const when = t.updatedAt || t.dueDate || t.createdAt
      const d = new Date(when)
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
      map.set(key, (map.get(key) || 0) + 1)
    })
    // ensure continuous range across selected window (max 180 days to keep simple)
    const series = []
    const s = new Date(start)
    const e = new Date(end)
    let cap = 0
    for (let dt = new Date(s); dt <= e; dt.setDate(dt.getDate() + 1)) {
      const key = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).toISOString()
      cap += map.get(key) || 0
      series.push({ x: new Date(dt), y: cap })
      if (series.length > 365) break
    }
    return series
  }, [filteredTasks, start, end])

  const onExport = (opt) => {
    if (opt === 'print') window.print()
  }

  // Decide which primary chart to render: if only 0-1 bars, show stock-like progression
  const showArea = tasksPerProject.length <= 1

  return (
    <motion.main variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight">Reports</h1>
      <p className="mt-2 text-gray-600">View detailed insights on projects, tasks and team performance.</p>

        {/* Filters row */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm">
              {['This Month','Last 30 Days','This Quarter','This Year','All Time'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="relative">
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm min-w-[200px]">
              {[{ _id: 'all', title: 'All Projects' }, ...projects.map(p => ({ _id: p._id, title: p.title || 'Untitled' }))].map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div className="ml-auto">
            <div className="inline-flex items-center gap-2">
              <button onClick={() => onExport('print')} className="rounded-xl cursor-pointer border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-100">Export PDF</button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Projects Completed" value={loading ? '...' : totalProjectsCompleted} />
          <StatCard title={`Tasks Completed ${timeRange === 'All Time' ? '' : 'This Period'}`} value={loading ? '...' : tasksCompletedThisRange} />
          <StatCard title="Average Task Completion Rate" value={loading ? '...' : `${avgCompletionRate}%`} />
          <StatCard title="Active Team Members" value={loading ? '...' : activeTeamMembers} />
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div variants={fadeInUp} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>{showArea ? 'Task Completion Trend' : 'Tasks Completed per Project'}</span>
            </div>
            {showArea ? (
              <AreaChart data={completionSeries} />
            ) : (
              <BarChart data={tasksPerProject.length ? tasksPerProject : [{ label: 'No Data', value: 0 }]} />
            )}
          </motion.div>
          <motion.div variants={fadeInUp} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-3 text-sm font-semibold text-gray-900">Task Distribution by Status</div>
            <PieChart data={useMemo(() => { const counts = { 'To Do': 0, 'In Progress': 0, 'Done': 0, 'Overdue': 0 }; const now = new Date().getTime(); filteredTasks.forEach(t => { const s = t?.status || 'To Do'; if (s === 'Done') counts['Done']++; else if (s === 'In Progress') counts['In Progress']++; else counts['To Do']++; if (s !== 'Done' && t?.dueDate && new Date(t.dueDate).getTime() < now) counts['Overdue']++; }); return [ { label: 'Todo', value: counts['To Do'] }, { label: 'In Progress', value: counts['In Progress'] }, { label: 'Completed', value: counts['Done'] }, { label: 'Overdue', value: counts['Overdue'] }, ]; }, [filteredTasks])} />
          </motion.div>
        </div>

        {/* Table */}
        <ProjectSummaryTable loading={loading} filteredTasks={filteredTasks} projects={projects} projectId={projectId} />

        {/* Bottom export button */}
        <div className="mt-6">
          <button onClick={() => onExport('print')} className="rounded-xl cursor-pointer border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-100">Export Report</button>
        </div>
      </motion.main>
  )
}

// Extract table into small component for clarity
const ProjectSummaryTable = ({ loading, filteredTasks, projects, projectId }) => {
  const rows = useMemo(() => {
    const byProj = new Map()
    filteredTasks.forEach(t => {
      const pid = t?.project?._id || t?.project
      const name = t?.project?.title || 'Unknown'
      const due = t?.dueDate ? new Date(t.dueDate) : null
      const upd = t?.updatedAt ? new Date(t.updatedAt) : (t?.createdAt ? new Date(t.createdAt) : null)
      if (!byProj.has(pid)) byProj.set(pid, { name, total: 0, done: 0, overdue: 0, lastUpdated: upd })
      const row = byProj.get(pid)
      row.total += 1
      if (t.status === 'Done') row.done += 1
      if (t.status !== 'Done' && due && due.getTime() < Date.now()) row.overdue += 1
      if (upd && (!row.lastUpdated || upd > row.lastUpdated)) row.lastUpdated = upd
    })

    const projList = projectId === 'all' ? projects : projects.filter(p => p._id === projectId)
    projList.forEach(p => {
      const pid = p._id
      if (!byProj.has(pid)) byProj.set(pid, { name: p.title || 'Untitled', total: 0, done: 0, overdue: 0, lastUpdated: p?.startDate ? new Date(p.startDate) : null })
    })

    return Array.from(byProj.values()).map(x => ({
      ...x,
      progress: x.total > 0 ? clampPercent((x.done / x.total) * 100) : 0
    })).sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredTasks, projects, projectId])

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white">
      <div className="grid grid-cols-12 gap-4 border-b border-gray-100 px-6 py-3 text-xs font-semibold text-gray-600">
        <div className="col-span-4">Project Name</div>
        <div className="col-span-2">Total Tasks</div>
        <div className="col-span-2">Completed Tasks</div>
        <div className="col-span-1">Overdue</div>
        <div className="col-span-2">Progress</div>
        <div className="col-span-1">Last Updated</div>
      </div>
      <div className="divide-y">
        {loading ? (
          <div className="px-6 py-4 text-sm text-gray-500">Loading...</div>
        ) : (
          rows.map((r, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-4 px-6 py-3 text-sm">
              <div className="col-span-4 text-gray-800">{r.name}</div>
              <div className="col-span-2">{r.total}</div>
              <div className="col-span-2">{r.done}</div>
              <div className="col-span-1">{r.overdue}</div>
              <div className="col-span-2">
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${r.progress}%` }} />
                </div>
                <div className="mt-1 text-xs text-gray-500">{r.progress}%</div>
              </div>
              <div className="col-span-1">{r.lastUpdated ? formatMonthYear(r.lastUpdated) : '-'}</div>
            </div>
          ))
        )}
        {!loading && rows.length === 0 && (
          <div className="px-6 py-4 text-sm text-gray-500">No data available for the selected filters.</div>
        )}
      </div>
    </div>
  )
}

export default Report