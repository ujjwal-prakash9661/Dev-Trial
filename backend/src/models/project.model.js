const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },

    description : {
        type : String
    },

    details : {
        type : String
    },

    status : {
        type : String,
        enum : ['In Progress', 'Completed', 'On Hold', 'Archived'],
        default : 'In Progress'
    },

    color : {
        type : String,
        enum : ['blue', 'green', 'yellow', 'gray'],
        default : 'blue'
    },

    startDate : {
        type : Date,
        default: Date.now
    },

    dueDate : {
        type : Date
    },

    priority : {
        type : String,
        enum : ['Low', 'Medium', 'High'],
        default : 'Medium'
    },

    progress : {
        type : Number,
        min : 0,
        max : 100,
        default : 0
    },

    teamMembers : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        }
    ],

    createdAt : {
        type : Date,
        default : Date.now
    },

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    }
})

const projectModel = mongoose.model('project', projectSchema);

module.exports = projectModel;