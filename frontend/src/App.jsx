import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail'
import Tasks from './pages/Tasks'
import Teams from './pages/Teams'
import Reports from './pages/Report'
import CreateProject from './pages/CreateProject'
import CreateTask from './pages/CreateTask'
import CreateTeam from './pages/CreateTeam'
import Layout from './components/Layout'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/login' replace />} />
        <Route path='/login' element={<Login />} />

        {/* Protected app shell with sticky navbar + responsive sidebar */}
        <Route element={<Layout />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/projects/createProject' element={<CreateProject />} />
          <Route path='/projects/:id' element={<ProjectDetail />} />
          <Route path='/tasks' element={<Tasks />} />
          <Route path='/tasks/createTask' element={<CreateTask />} />
          <Route path='/teams' element={<Teams />} />
          <Route path='/teams/createTeam' element={<CreateTeam />} />
          <Route path='/reports' element={<Reports />} />
        </Route>

        <Route path='*' element={<div className='w-full h-full p-8 flex flex-col justify-center items-center bg-black'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <h2 className='text-8xl text-red-700 font-bold'>Record Not Found !!!</h2>
          </div>
        </div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
