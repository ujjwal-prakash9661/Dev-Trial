const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    githubId : {
        type: String,
        required: true,
        unique: true
    },

    username : {
        type: String,
        required: true,
    },

    email : {
        type: String,
    },

    avatarUrl : {
        type: String,
    },

    profileUrl : {
        type: String,
    },

    createAt : {
        type : Date,
        default : Date.now
    }
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel