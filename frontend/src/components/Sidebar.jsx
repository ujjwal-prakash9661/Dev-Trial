import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'

const Item = ({ to, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 ${isActive ? 'bg-red-50 text-red-600' : 'text-gray-700'}`}
  >
    <span className="text-lg">{icon}</span>
    <span>{children}</span>
  </NavLink>
)

const Sidebar = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get('https://dev-trial-7mpp.onrender.com/api/auth/me', { withCredentials: true })
        setUser(res.data || null)
      } catch (_) {
        setUser(null)
      }
    }
    loadUser()
  }, [])

  const avatarSrc = user?.avatarUrl || 'https://i.pravatar.cc/64?img=11'

  return (
    <aside className="hidden h-[calc(100vh-56px)] w-64 shrink-0 border-r border-gray-200/80 bg-white">
      <div className="flex items-center gap-2 px-2 py-3 text-lg font-semibold">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-red-500 text-white text-xs font-bold">▢</span>
        Dev-Trial
      </div>

      <div className="space-y-1">
        <Item to="/dashboard" icon="📊">Dashboard</Item>
        <Item to="/projects" icon="📁">Projects</Item>
        <Item to="/tasks" icon="📝">Tasks</Item>
        <Item to="/teams" icon="👥">Team</Item>
        <Item to="/reports" icon="📈">Reports</Item>
      </div>

      <div className="mt-auto hidden p-1 md:flex">
        <div className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <img className="h-10 w-10 rounded-full" src={avatarSrc} alt="user" />
          <div className="min-w-0 text-sm flex flex-col gap-1">
            <div className="truncate font-medium">{user?.name || user?.username || '—'}</div>
            <div className="truncate text-gray-500">{user?.email || ''}</div>
          </div>
          <button
            onClick={async () => {
              try {
                await axios.post('https://dev-trial-7mpp.onrender.com/api/auth/logout', {}, { withCredentials: true })
                window.location.href = 'http://localhost:5173/'
              } catch (_) {}
            }}
            className="ml-auto cursor-pointer rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-100"
            title="Logout"
          >Logout</button>
        </div>
      </div>
      
    </aside>
  )
}

export default Sidebar