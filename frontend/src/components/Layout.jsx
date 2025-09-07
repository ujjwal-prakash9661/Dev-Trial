import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import HamburgerSidebar from './HamburgerSidebar'
import { AnimatePresence, motion } from 'framer-motion'
import { pageVariants, pageTransition } from '../motionPresets'

// App shell with sticky Navbar and responsive Sidebar
const Layout = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar brand="Dev-Trial" showSearch={true} />
      <div className="mx-auto flex flex-col w-full gap-4">
        {/* Sidebar occupies fixed width; main should fill remaining without extra side space */}
        <HamburgerSidebar />
        <main className="min-h-[calc(100vh-56px)] flex-1 px-4 sm:px-6 lg:px-8 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default Layout