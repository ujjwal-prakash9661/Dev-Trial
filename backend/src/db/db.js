const mongoose = require('mongoose')

function connectDB()
{
    mongoose.connect(process.env.MONGO_URI)

    .then(() => {
        console.log("Connected To MongoDB");
    })

    .catch((err) => {
        console.log("Server encounted an error", err);
    })
}

module.exports = connectDB