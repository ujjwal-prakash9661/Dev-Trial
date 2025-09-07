const taskModel = require('../models/task.model')

async function createTask(req, res)
{
    const { title, description, status, priority, startDate, dueDate, progress, project, assignee } = req.body

     if (!title || !project) 
    {
        return res.status(400).json({
            message: "Title and Project are required"
        })
    }

    const task = await taskModel.create({
        title,
        description,
        status,
        priority,
        startDate,
        dueDate,
        progress,
        project,
        assignee,
        createdBy: req.user._id
    })

    return res.status(201).json({
        message : "Task Created Successfully",
        task
    })
}

async function getTasks(req, res)
{
    const tasks = await taskModel.find({
        $or : [
            {createdBy : req.user._id},
            {assignee : req.user._id}
        ]
    }).populate('project assignee createdBy comments.user')

    if(!tasks)
    {
        return res.status(404).json({
            message : 'No Tasks Found'
        })
    }

    res.status(200).json({
        message : "Tasks Fetched Successfully",
        tasks
    })
}

async function getTaskByProject(req, res)
{
    const {projectId} = req.params

    const tasks = await taskModel.find({
        project : projectId,

        $or : [
            {createdBy : req.user._id},
            {assignee : req.user._id}
        ]
    }).populate('project assignee createdBy comments.user')

    if(!tasks.length)
    {
        return res.status(404).json({
            message : "No Task Found for this Project"
        })
    }

    res.status(200).json({
        message : "Tasks Fetched Successfully",
        tasks
    })
}

async function getTaskById(req, res)
{
    const { id } = req.params

    const task = await taskModel.findOne({
        _id : id,

        $or : [
            {createdBy : req.user._id},
            {assignee : req.user._id}
        ]
    }).populate('project assignee createdBy comments.user')

    if(!task)
    {
        return res.status(404).json({
            message : "Task not found"
        })
    }

    res.status(200).json({
        message : "Task fetched successfully",
        task
    })
}

async function updateTask(req, res)
{
    const { id } = req.params
    const { title, description, status, priority, startDate, dueDate, progress, assignee } = req.body

    const update = {}

    if(title !== undefined) update.title = title
    if(description !== undefined) update.description = description
    if(status !== undefined) update.status = status
    if (priority !== undefined) update.priority = priority
    if (startDate !== undefined) update.startDate = startDate
    if (dueDate !== undefined) update.dueDate = dueDate
    if (progress !== undefined) update.progress = progress
    if (assignee !== undefined) update.assignee = assignee

    if(Object.keys(update).length === 0)
    {
        return res.status(400).json({
            message : "Nothing to Update"
        })
    }

    const task = await taskModel.findOneAndUpdate(
        {_id : id, createdBy : req.user._id},
        update,
        { new : true}
    )

    if(!task)
    {
        return res.status(404).json({
            message : "Task Not Found"
        })
    }

    res.status(200).json({
        message : "Task updated successfully",
        task
    })
}

async function deleteTask(req, res)
{
    const { id } = req.params

    const task = await taskModel.findOneAndDelete({
        _id : id,
        createdBy : req.user._id
    })

    if(!task)
    {
        return res.status(404).json({
            message : "Task Not Found"
        })
    }

    res.status(200).json({
        message : "Task Deleted Successfully",
        task
    })
}

async function addComment(req, res)
{
    const { id } = req.params
    const { text } = req.body

    if(!text)
    {
        return res.status(400).json({
            message : "Comment is Required"
        })
    }

    const task = await taskModel.findById(id)

    if(!task)
    {
        return res.status(404).json({
            message : "Task Not Found"
        })
    }

    task.comments.push({
        user : req.user._id,
        text
    })

    await task.save()

    res.status(200).json({
        message : "Comment Added Successfully",
        task
    })
}

async function updateProgress(req, res)
{
    const { id } = req.params
    const { progress } = req.body

    if(progress === undefined)
    {
        return res.status(400).json({
            message : "Progress is Required"
        })
    }

    if(progress < 0 || progress > 100)
    {
        return res.status(400).json({
            message : "Progress should be between 0 and 100"
        })
    }

    const update = { progress }

    if(progress === 100)
    {
        update.status = 'Completed'
    }

    const task = await taskModel.findOneAndUpdate(
        {_id : id, createdBy : req.user._id},
        update,
        { new : true}
    ).populate('project assignee createdBy comments.user')

    if(!task)
    {
        return res.status(404).json({
            message : "Task Not Found"
        })
    }

    res.status(200).json({
        message : "Progress Updated Successfully",
        task
    })
}



module.exports = {
    createTask,
    getTasks,
    getTaskByProject,
    getTaskById,
    updateTask,
    deleteTask,
    addComment,
    updateProgress
}