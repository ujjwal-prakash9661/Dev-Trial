import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { fadeInUp, staggerContainer } from '../motionPresets'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formDraft, setFormDraft] = useState({
    title: "",
    description: "",
    details: "",
    dueDate: "",
    priority: "Low",
    progress: 0,
    status: "In Progress",
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`https://dev-trial-7mpp.onrender.com/api/projects/${id}`, {
          withCredentials: true
        })

        const p = res.data?.project || null
        setProject(p)
        setFormDraft({
          title: p?.title || "",
          description: p?.description || "",
          details: p?.details || "",
          dueDate: p?.dueDate ? new Date(p.dueDate).toISOString().slice(0, 10) : "",
          priority: p?.priority || "Low",
          progress: Number(p?.progress || 0),
          status: p?.status || "In Progress",
        })
      } catch (err) {
        console.log("Error fetching project!", err)
        setProject(null)
      }
    }

    fetchProjects()
  }, [id])

  if (!project) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-600">
        Loading project...
      </div>
    )
  }

  return (
    <motion.main
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl px-3 sm:px-4 pb-20 pt-4 sm:pb-12 sm:pt-6 lg:px-8"
    >
      <motion.div
        variants={fadeInUp}
        className="rounded-2xl border border-gray-200 bg-white p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            {!isEditing ? (
              <>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Project: {project.title}
                </h1>
                <p className="mt-2 max-w-3xl text-gray-600 break-words whitespace-pre-wrap">
                  {project.description}
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  className="w-full max-w-xl rounded border border-gray-300 p-2 text-2xl font-bold outline-none focus:ring-2 focus:ring-red-300"
                  value={formDraft.title}
                  onChange={(e) =>
                    setFormDraft((v) => ({ ...v, title: e.target.value }))
                  }
                  placeholder="Title"
                />
                <textarea
                  className="w-full max-w-3xl rounded border border-gray-300 p-3 text-gray-800 outline-none focus:ring-2 focus:ring-red-300"
                  rows={2}
                  value={formDraft.description}
                  onChange={(e) =>
                    setFormDraft((v) => ({ ...v, description: e.target.value }))
                  }
                  placeholder="Short description"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                className="cursor-pointer rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  className="cursor-pointer rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => {
                    setIsEditing(false)
                    setFormDraft({
                      title: project.title || "",
                      description: project.description || "",
                      details: project.details || "",
                      dueDate: project.dueDate
                        ? new Date(project.dueDate).toISOString().slice(0, 10)
                        : "",
                      priority: project.priority || "Low",
                      progress: Number(project.progress || 0),
                      status: project.status || "In Progress",
                    })
                  }}
                >
                  Cancel
                </button>
                <button
                  className="cursor-pointer rounded-full bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                  onClick={async () => {
                    try {
                      const payload = {
                        title: formDraft.title?.trim(),
                        description: formDraft.description?.trim(),
                        details: formDraft.details?.trim(),
                        dueDate: formDraft.dueDate || undefined,
                        priority: formDraft.priority,
                        progress: Math.max(
                          0,
                          Math.min(100, Number(formDraft.progress))
                        ),
                        status: formDraft.status,
                      }
                      const res = await axios.put(
                        `https://dev-trial-7mpp.onrender.com/api/projects/${id}`,
                        payload,
                        { withCredentials: true }
                      )
                      setProject(res.data?.project || { ...project, ...payload })
                      setIsEditing(false)
                    } catch (err) {
                      console.error("Failed to save changes", err)
                      alert("Failed to save changes")
                    }
                  }}
                >
                  Save
                </button>
              </>
            )}
            <button className="cursor-pointer rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
              Share
            </button>
            <button
              className="cursor-pointer rounded-full bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
              onClick={async () => {
                if (!confirm("Delete this project?")) return
                try {
                  await axios.delete(
                    `https://dev-trial-7mpp.onrender.com/api/projects/${id}`,
                    { withCredentials: true }
                  )
                  navigate("/projects")
                } catch (err) {
                  console.error("Failed to delete project", err)
                  alert("Failed to delete project")
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left */}
          <div>
            {!isEditing ? (
              <p className="text-gray-700 break-words whitespace-pre-wrap">
                {project.details}
              </p>
            ) : (
              <textarea
                className="w-full rounded border border-gray-300 p-3 text-gray-800 outline-none focus:ring-2 focus:ring-red-300"
                rows={8}
                value={formDraft.details}
                onChange={(e) =>
                  setFormDraft((v) => ({ ...v, details: e.target.value }))
                }
                placeholder="Details"
              />
            )}

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900">
                Team Members
              </h3>
              <div className="mt-3 flex items-center gap-3">
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  project.teamMembers.map((member, i) => (
                    <img
                      key={member._id || i}
                      className="h-10 w-10 rounded-full ring-2 ring-white"
                      src={
                        member?.avatarUrl
                          ? member.avatarUrl
                          : `https://i.pravatar.cc/64?u=${member?._id || member}`
                      }
                      alt={member?.username || "member"}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No team members yet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900">Progress</h3>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Overall Progress</span>
                  {!isEditing ? <span>{project.progress}%</span> : null}
                </div>
                {!isEditing ? (
                  <>
                    <div className="mt-2 h-3 rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full bg-red-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formDraft.progress}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setFormDraft((v) => ({
                          ...v,
                          progress: val,
                          status:
                            val === 100
                              ? "Completed"
                              : v.status === "Completed"
                              ? "In Progress"
                              : v.status,
                        }))
                      }}
                      className="w-full"
                    />
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={formDraft.status === "Completed"}
                          onChange={(e) =>
                            setFormDraft((v) => ({
                              ...v,
                              status: e.target.checked
                                ? "Completed"
                                : v.status === "Completed"
                                ? "In Progress"
                                : v.status,
                              progress: e.target.checked ? 100 : v.progress,
                            }))
                          }
                        />
                        Mark as completed
                      </label>
                      <span>{formDraft.progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right - Metadata */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Metadata
            </h3>
            <div className="divide-y rounded-xl border border-gray-200 bg-white">
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <div className="col-span-1 text-gray-500">Start Date</div>
                <div className="col-span-2">
                  {project.startDate
                    ? new Date(project.startDate).toDateString()
                    : "—"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <div className="col-span-1 text-gray-500">Due Date</div>
                <div className="col-span-2">
                  {!isEditing ? (
                    project.dueDate
                      ? new Date(project.dueDate).toDateString()
                      : "—"
                  ) : (
                    <input
                      type="date"
                      className="w-full rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-red-300"
                      value={formDraft.dueDate}
                      onChange={(e) =>
                        setFormDraft((v) => ({
                          ...v,
                          dueDate: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <div className="col-span-1 text-gray-500">Priority</div>
                <div className="col-span-2">
                  {!isEditing ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                      {project.priority}
                    </span>
                  ) : (
                    <select
                      className="w-40 rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-red-300"
                      value={formDraft.priority}
                      onChange={(e) =>
                        setFormDraft((v) => ({ ...v, priority: e.target.value }))
                      }
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <div className="col-span-1 text-gray-500">Status</div>
                <div className="col-span-2">
                  {!isEditing ? (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {project.status}
                    </span>
                  ) : (
                    <select
                      className="w-48 rounded border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-red-300"
                      value={formDraft.status}
                      onChange={(e) =>
                        setFormDraft((v) => ({ ...v, status: e.target.value }))
                      }
                    >
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>On Hold</option>
                      <option>Archived</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.main>
  )
}

export default ProjectDetail
