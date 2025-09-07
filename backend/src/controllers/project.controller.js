const projectModel = require('../models/project.model')
const teamModel = require('../models/team.model')

async function getProject(req, res)
{
    const projects = await projectModel
        .find({ user : req.user._id})
        .populate('teamMembers')

    if(!projects.length)
    {
        return res.status(404).json({
            message : "No Project Found"
        })
    }

    res.status(200).json({
        message : "Project fetched successfully",
        projects
    })
}

async function createProject(req, res)
{
    try {
        const { title, description, details, status, color, startDate, dueDate, priority, progress, teamMembers, teams } = req.body

        if(!title)
        {
            return res.status(400).json({
                message : "Title is required"
            })
        }

        // Normalize teamMembers: accept array of strings/ObjectIds or comma-separated string
        let normalizedTeam = []
        if (Array.isArray(teamMembers)) {
            normalizedTeam = teamMembers
        } else if (typeof teamMembers === 'string') {
            normalizedTeam = teamMembers.split(',').map(s => s.trim()).filter(Boolean)
        }

        // Normalize teams (optional) - can be array or comma-separated string
        let normalizedTeams = []
        if (Array.isArray(teams)) {
            normalizedTeams = teams
        } else if (typeof teams === 'string') {
            normalizedTeams = teams.split(',').map(s => s.trim()).filter(Boolean)
        }

        // If no teamMembers provided but teams selected, auto-populate members from selected teams
        if (normalizedTeam.length === 0 && normalizedTeams.length > 0) {
            const accessibleTeams = await teamModel.find({
                _id: { $in: normalizedTeams },
                $or: [ { createdBy: req.user._id }, { members: req.user._id } ]
            }, { members: 1 })

            const memberSet = new Set()
            for (const t of accessibleTeams) {
                for (const m of (t.members || [])) memberSet.add(String(m))
            }
            normalizedTeam = Array.from(memberSet)
        }

        const project = await projectModel.create({
            title,
            description,
            details,
            status,     // allow overriding default
            color,      // allow overriding default
            startDate,
            dueDate,
            priority,
            progress,
            teamMembers: normalizedTeam,
            user : req.user._id
        })

        // If teams were provided, link this project back to those teams
        if (normalizedTeams.length > 0) {
            await teamModel.updateMany(
                { _id: { $in: normalizedTeams } },
                { $addToSet: { projects: project._id } }
            )
        }

        return res.status(201).json({
            message : "Project created successfully",
            project
        })
    } catch (err) {
        console.error('createProject error:', err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateProject(req, res)
{
    const { id } = req.params
    let { title, description, details, dueDate, priority, progress, status, color, startDate, teamMembers } = req.body

    // Build update object only with provided fields
    const update = {}
    if (title !== undefined) update.title = title
    if (description !== undefined) update.description = description
    if (details !== undefined) update.details = details
    if (dueDate !== undefined) update.dueDate = dueDate
    if (priority !== undefined) update.priority = priority
    if (progress !== undefined) update.progress = progress
    if (status !== undefined) update.status = status
    if (color !== undefined) update.color = color
    if (startDate !== undefined) update.startDate = startDate

    // Normalize teamMembers if provided (accept array or comma-separated string)
    if (teamMembers !== undefined) {
        if (Array.isArray(teamMembers)) {
            update.teamMembers = teamMembers
        } else if (typeof teamMembers === 'string') {
            update.teamMembers = teamMembers
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
        } else {
            update.teamMembers = []
        }
    }

    if (Object.keys(update).length === 0)
    {
        return res.status(400).json({
            message : "No fields to update"
        })
    }

    // Auto-set status to Completed when progress hits 100 (unless explicitly provided)
    if (update.progress === 100 && update.status === undefined) {
        update.status = 'Completed'
    }

    const project = await projectModel.findOneAndUpdate(
        { _id : id, user : req.user._id},
        update,
        {new : true}
    )

    if(!project)
    {
        return res.status(404).json({
            message : "Project not found"
        })
    }

    res.status(200).json({
        message : "Project updated successfully",
        project
    })
}

async function getProjectById(req, res)
{
    const { id } = req.params

    const project = await projectModel
        .findOne({_id : id, user : req.user._id})
        .populate('teamMembers')

    if(!project)
    {
        return res.status(404).json({
            message : "Project not found"
        })
    }

    // Also include members from any teams that are linked to this project
    const teamsWithProject = await teamModel
        .find({
            projects: project._id,
            $or: [ { createdBy: req.user._id }, { members: req.user._id } ]
        })
        .populate('members')

    const existingMembers = Array.isArray(project.teamMembers) ? project.teamMembers : []
    const memberMap = new Map()

    for (const m of existingMembers) {
        if (!m) continue
        const key = String(m._id || m)
        if (!memberMap.has(key)) memberMap.set(key, m)
    }

    for (const t of teamsWithProject) {
        for (const m of (t.members || [])) {
            if (!m) continue
            const key = String(m._id || m)
            if (!memberMap.has(key)) memberMap.set(key, m)
        }
    }

    const mergedMembers = Array.from(memberMap.values())
    const projectObj = project.toObject()
    // Expose raw (direct) team members for editing on client
    projectObj.rawTeamMembers = existingMembers
    projectObj.rawTeamMemberIds = existingMembers.map(m => String(m._id || m))
    // Keep merged list for display
    projectObj.teamMembers = mergedMembers

    res.status(200).json({
        message : "Project Fetched successfully",
        project: projectObj
    })
}

async function deleteProject(req, res)
{
    const { id } = req.params

    const project = await projectModel.findOneAndDelete({_id : id, user : req.user._id})

    if(!project)
    {
        return res.status(404).json({
            message : "Project not found"
        })
    }

    return res.status(200).json({
        message : "Project deleted successfully",
        project
    })
}

module.exports = {
    getProject,
    createProject,
    updateProject,
    getProjectById,
    deleteProject
}