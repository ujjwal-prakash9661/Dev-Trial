const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },

    description : {
        type : String,
    },

    status : {
        type : String,
        enum : ["To Do", "In Progress", "Done"],
        default : "To Do"
    },

    priority : {
        type : String,
        enum : ["Low", "Medium", "High"],
        default : "Medium"
    },

    startDate : {
        type : Date,
        default : Date.now()
    },

    dueDate : {
        type : Date,
    },

    progress : {
        type : Number,
        default : 0
    },

    project : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'project',
        required : true
    },

    assignee : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
    },

    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },

    
    comments : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'user'
            },

            text : {
                type : String,
                required : true
            },

            createdAt : {
                type : Date,
                default : Date.now
            }
        }
    ]
}, 
    {
        timestamps: true,
    }
)

const taskModel = mongoose.model("task", taskSchema);

module.exports = taskModel;