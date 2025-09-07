const cookieParser = require('cookie-parser')
const express = require('express')
const authRoutes = require('./routes/auth.route')
const projectRoutes = require('../src/routes/project.route')
const taskRoutes = require('./routes/task.route')
const teamRoutes = require('./routes/team.routes')
const path = require("path");
const cors = require('cors')

const app = express()

app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(express.static(path.join(__dirname, '../public')));


app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/teams', teamRoutes)

app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app