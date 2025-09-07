import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'

// Top navigation bar with: user profile fetch, notifications dropdown, and functional search
const Navbar = ({ brand = 'Dev-Trial', showSearch = false }) => {
  const navigate = useNavigate()

  // User profile
  const [user, setUser] = useState(null)

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef(null)

  // Search
  const [q, setQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState({ projects: [], tasks: [], teams: [] })
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // User menu
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef(null)

  useEffect(() => {
    // Load current user
    const loadUser = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/auth/me', { withCredentials: true })
        setUser(res.data || null)
      } catch (_) {
        setUser(null)
      }
    }

    // Build simple notifications (e.g., upcoming task deadlines)
    const loadNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/tasks', { withCredentials: true })
        const tasks = res.data?.tasks || []
        const now = new Date()
        const soon = tasks
          .filter(t => t.dueDate)
          .map(t => ({ ...t, dueTime: new Date(t.dueDate).getTime() }))
          .filter(t => t.dueTime >= now.getTime())
          .sort((a,b) => a.dueTime - b.dueTime)
          .slice(0, 5)

        const items = soon.map(t => ({
          id: t._id,
          text: `Task "${t.title}" due ${new Date(t.dueDate).toDateString()}`,
          link: '/tasks',
          read: false
        }))
        setNotifications(items)
        setUnreadCount(items.filter(i => !i.read).length)
      } catch (_) {
        setNotifications([])
        setUnreadCount(0)
      }
    }

    loadUser()
    loadNotifications()

    // Outside click handlers
    const onDocClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  // Debounced search across projects, tasks, teams
  useEffect(() => {
    if (!showSearch) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q || q.trim().length < 2) {
      setResults({ projects: [], tasks: [], teams: [] })
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const [p, t, tm] = await Promise.all([
          axios.get('http://localhost:3000/api/projects', { withCredentials: true }).catch(() => ({ data: { projects: [] } })),
          axios.get('http://localhost:3000/api/tasks', { withCredentials: true }).catch(() => ({ data: { tasks: [] } })),
          axios.get('http://localhost:3000/api/teams', { withCredentials: true }).catch(() => ({ data: { teams: [] } }))
        ])
        const term = q.toLowerCase()
        const projs = (p.data?.projects || []).filter(x => (x.title || '').toLowerCase().includes(term))
        const tasks = (t.data?.tasks || []).filter(x => (x.title || '').toLowerCase().includes(term))
        const teams = (tm.data?.teams || []).filter(x => (x.name || '').toLowerCase().includes(term))
        setResults({ projects: projs.slice(0,5), tasks: tasks.slice(0,5), teams: teams.slice(0,5) })
      } finally {
        setSearching(false)
      }
    }, 250)
  }, [q, showSearch])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const onSelectResult = (type, item) => {
    if (type === 'project') navigate(`/projects/${item._id}`)
    else if (type === 'task') navigate('/tasks')
    else if (type === 'team') navigate('/teams')
    setSearchOpen(false)
    setQ('')
  }

  const avatarSrc = user?.avatarUrl || 'https://i.pravatar.cc/64?img=5'

  // Mobile sidebar removed

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto w-full flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand (toggles sidebar on small screens) */}
        <Link
          to="/dashboard"

          className="flex items-center gap-2 font-semibold"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-red-500 text-white text-xs font-bold">▢</span>
          <span>{brand}</span>
        </Link>

        {/* Center nav */}
        <nav className="ml-6 hidden gap-6 text-sm text-gray-600 md:flex">
          <NavLink to='/dashboard' className={({isActive}) => `hover:text-gray-900 ${isActive ? 'text-gray-900 font-medium' : ''}`}>Dashboard</NavLink>
          <NavLink to='/projects' className={({isActive}) => `hover:text-gray-900 ${isActive ? 'text-gray-900 font-medium' : ''}`}>Projects</NavLink>
          <NavLink to='/tasks' className={({isActive}) => `hover:text-gray-900 ${isActive ? 'text-gray-900 font-medium' : ''}`}>My Tasks</NavLink>
          <NavLink to='/teams' className={({isActive}) => `hover:text-gray-900 ${isActive ? 'text-gray-900 font-medium' : ''}`}>Teams</NavLink>
          <NavLink to='/reports' className={({isActive}) => `hover:text-gray-900 ${isActive ? 'text-gray-900 font-medium' : ''}`}>Reports</NavLink>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {showSearch && (
            <div ref={searchRef} className="relative hidden md:block">
              <input
                type="text"
                value={q}
                onChange={(e) => { setQ(e.target.value); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search projects, tasks, teams..."
                className="w-72 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-gray-300 focus:bg-white"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>

              {searchOpen && (q?.trim().length >= 2 || searching) && (
                <div className="absolute left-0 mt-2 w-[28rem] rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  {searching ? (
                    <div className="p-3 text-sm text-gray-600">Searching...</div>
                  ) : (
                    <div className="max-h-80 overflow-auto">
                      {results.projects.length === 0 && results.tasks.length === 0 && results.teams.length === 0 ? (
                        <div className="p-3 text-sm text-gray-600">No results</div>
                      ) : (
                        <div className="space-y-3">
                          {results.projects.length > 0 && (
                            <div>
                              <div className="px-2 pb-1 text-xs font-semibold text-gray-500">Projects</div>
                              {results.projects.map(p => (
                                <button key={p._id} onClick={() => onSelectResult('project', p)} className="w-full cursor-pointer rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50">
                                  {p.title}
                                </button>
                              ))}
                            </div>
                          )}
                          {results.tasks.length > 0 && (
                            <div>
                              <div className="px-2 pb-1 text-xs font-semibold text-gray-500">Tasks</div>
                              {results.tasks.map(t => (
                                <button key={t._id} onClick={() => onSelectResult('task', t)} className="w-full cursor-pointer rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50">
                                  {t.title}
                                </button>
                              ))}
                            </div>
                          )}
                          {results.teams.length > 0 && (
                            <div>
                              <div className="px-2 pb-1 text-xs font-semibold text-gray-500">Teams</div>
                              {results.teams.map(tm => (
                                <button key={tm._id} onClick={() => onSelectResult('team', tm)} className="w-full cursor-pointer rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50">
                                  {tm.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
              title="Notifications"
            >
              <span>🔔</span>
              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">{unreadCount}</span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                <div className="flex items-center justify-between px-2 pb-2 text-sm font-medium text-gray-700">
                  <span>Notifications</span>
                  <button className="cursor-pointer text-xs text-red-600 hover:underline" onClick={markAllRead}>Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-sm text-gray-600">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => { navigate(n.link); setNotifOpen(false) }}
                        className={`w-full cursor-pointer rounded px-2 py-2 text-left text-sm hover:bg-gray-50 ${n.read ? 'text-gray-600' : 'text-gray-900'}`}
                      >
                        {n.text}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar + user menu */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => setUserOpen(o => !o)}
              className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-gray-200"
              title={user?.name || user?.username || ''}
            >
              <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover cursor-pointer" />
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                <div className="flex items-center gap-3 px-2 py-2">
                  <img src={avatarSrc} alt="u" className="h-9 w-9 rounded-full" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-900">{user?.name || user?.username || '—'}</div>
                    <div className="truncate text-xs text-gray-500">{user?.email || ''}</div>
                  </div>
                </div>
                <div className="my-2 h-px bg-gray-100" />
                <button onClick={() => { setUserOpen(false); navigate('/dashboard') }} className="w-full cursor-pointer rounded px-2 py-2 text-left text-sm hover:bg-gray-50">Profile</button>
                <button
                  onClick={async () => {
                    try {
                      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true })
                      window.location.href = 'http://localhost:5173/'
                    } catch (_) {}
                  }}
                  className="w-full cursor-pointer rounded px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>


    </header>
  )
}

export default Navbar