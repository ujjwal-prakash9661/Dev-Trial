const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true,
        trim : true
    },

    description : {
        type : String,

    },

    members : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        }
    ],

    projects : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'project'
        }
    ],

    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : true
    },

    createdAt : {
        type : Date,
        default : Date.now
    }
})

const teamModel = mongoose.model("team", teamSchema)

module.exports = teamModel