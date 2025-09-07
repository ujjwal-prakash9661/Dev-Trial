const teamModel = require('../models/team.model')

async function createTeam(req, res)
{
    const {name, description, members, projects } = req.body

    if(!name)
    {
        return res.status(401).json({
            message: "Name is required"
        })
    }

    const team = await teamModel.create({
        name,
        description,
        members,
        projects,
        createdBy : req.user._id
    })

    res.status(201).json({
        message : "Team created successfully",
        team
    })
}

async function getTeams(req, res)
{
    const teams = await teamModel.find({
        $or : [
            {createdBy : req.user._id},
            {members : req.user._id}
        ]
    }).populate('members projects createdBy')

    if(!teams.length)
    {
        return res.status(404).json({
            message : "No teams found"
        })
    }

    res.status(200).json({
        message : "Teams fetched successfully",
        teams
    })
}

async function getTeamById(req, res)
{
    const { id } = req.params

    const team = await teamModel.findOne({
        _id : id,
        $or : [
            { createdBy : req.user._id },
            { members : req.user._id }
        ]
    }).populate('members projects createdBy')

    if(!team)
    {
        return res.status(404).json({
            message : "Team not found"
        })
    }

    res.status(200).json({
        message : "Team fetched successfully",
        team
    })
}

async function updateTeam(req, res)
{
    const { id } = req.params
    const {name, description, members, projects} = req.body

    const update = {}
    if(name !== undefined) update.name = name
    if(description !== undefined) update.description = description
    if(members !== undefined) update.members = members
    if(projects !== undefined) update.projects = projects

    if(Object.keys(update).length === 0)
    {
        return res.status(400).json({
            message : "Nothing to update"
        })
    }

    const team = await teamModel.findOneAndUpdate(
        {_id : id, createdBy : req.user._id},
        update,
        { new : true}
    ).populate('members projects createdBy')

    if(!team)
    {
        return res.status(404).json({
            message : "Team not found or you are not authorized to edit this team"
        })
    }

    res.status(200).json({
        message : "Team updated successfully",
        team
    })
}

async function deleteTeam(req, res)
{
    const { id } = req.params
    
    const team = await teamModel.findOneAndDelete({
        _id : id,
        createdBy : req.user._id
    })

    if(!team)
    {
        return res.status(404).json({
            message : "Team not found or you are not authorized to delete this team"
        })
    }

    res.status(200).json({
        message : "Team deleted successfully",
        team
    })
}

module.exports = {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam
}