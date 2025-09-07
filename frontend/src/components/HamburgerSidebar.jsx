import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

/**
 * Responsive Hamburger Sidebar (boxed)
 * - Mobile: hamburger button toggles a slide-in drawer with an overlay
 * - Desktop (md+): static boxed sidebar shown on the left
 *
 * Usage: <HamburgerSidebar />
 * Replace your existing <Sidebar /> with this in Layout if desired.
 */

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/projects', label: 'Projects', icon: '📁' },
  { to: '/tasks', label: 'Tasks', icon: '📝' },
  { to: '/teams', label: 'Teams', icon: '👥' },
  { to: '/reports', label: 'Reports', icon: '📈' },
]

const Item = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 ${isActive ? 'bg-red-50 text-red-600' : 'text-gray-700'}`}
  >
    <span className="text-lg">{icon}</span>
    <span className="truncate">{children}</span>
  </NavLink>
)

const BoxedSidebarContent = ({ onNavigate }) => {
  // Show ONLY the labeled menu (remove icon rail to avoid duplicate navigation)
  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white">
      <div className="p-2">
        <div className="mb-2 flex items-center gap-2 px-2 py-1">
          {/* <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-red-500 text-white text-xs font-bold">▢</span> */}
          {/* <div className="text-sm font-semibold">ProjectFlow</div> */}
        </div>
        <div className="space-y-1">
          {navItems.map((n) => (
            <Item key={n.to} to={n.to} icon={n.icon} onClick={onNavigate}>{n.label}</Item>
          ))}
        </div>
        <div className="my-3 h-px bg-gray-100" />
        <div>
          <div className="px-3 pb-1 text-xs font-semibold text-gray-500">Themes</div>
          <div className="space-y-1">
            <button className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100" type="button">Office 2016 White</button>
            <button className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100" type="button">Office 2016 Black</button>
            <button className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100" type="button">Office 2016 Colorful</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const HamburgerSidebar = () => {
  const [open, setOpen] = useState(false)
  const [showButton, setShowButton] = useState(true)
  const panelRef = useRef(null)

  // Close on outside click (mobile drawer)
  useEffect(() => {
    const onClick = (e) => {
      if (!open) return
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [open])

  // Hide menu button on scroll > 0, show at top
  useEffect(() => {
    const onScroll = () => {
      setShowButton(window.scrollY < 4)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="sticky top-14 z-20">
      {/* Menu button aligned under the navbar brand (container matches navbar max width) */}
      {showButton && (
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
            aria-label="Open sidebar"
            aria-expanded={open}
          >
            <span className="text-lg">☰</span>
            <span>Menu</span>
          </button>
        </div>
      )}

      {/* Static sidebar removed so hamburger is used on all screens */}
      {/* <div className="hidden h-[calc(100vh-56px)] w-72 md:block">
        <BoxedSidebarContent onNavigate={() => {  }} />
      </div> */}

      {/* Drawer (all breakpoints) */}
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          {/* Panel from under the navbar (align below top bar) */}
          <div className="absolute left-0 top-14 h-[calc(100vh-56px)] w-80 max-w-[85vw] p-3" aria-label="Sidebar panel">
            <div
              ref={panelRef}
              className="h-full w-full translate-x-0 animate-[slideIn_.2s_ease-out] bg-transparent"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-red-500 text-white text-xs font-bold">▢</span> 
                  <span className="font-semibold">ProjectFlow</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-200"
                  aria-label="Close sidebar"
                >
                  ×
                </button>
              </div>
              <BoxedSidebarContent onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Keyframes for slide-in (scoped via Tailwind arbitrary value) */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(-8px); opacity: .6 } to { transform: translateX(0); opacity: 1 } }
      `}</style>
    </div>
  )
}

export default HamburgerSidebar