const express = require('express');
const taskController = require('../controllers/task.controller')
const authMiddleware = require('../middleware/auth.middleware')

const router = express.Router()

router.post('/',authMiddleware.authUser, taskController.createTask)
router.get('/',authMiddleware.authUser, taskController.getTasks)
router.get('/projects/:projectId',authMiddleware.authUser, taskController.getTaskByProject)
router.get('/:id',authMiddleware.authUser, taskController.getTaskById)
router.put('/:id',authMiddleware.authUser, taskController.updateTask)
router.delete('/:id',authMiddleware.authUser, taskController.deleteTask)
router.post('/:id/comments',authMiddleware.authUser, taskController.addComment)
router.patch('/:id/progress',authMiddleware.authUser, taskController.updateProgress)


module.exports = router;