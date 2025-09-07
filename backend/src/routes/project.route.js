const express = require('express');
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth.middleware')

const router = express.Router();

router.get('/', authMiddleware.authUser, projectController.getProject)
router.post('/', authMiddleware.authUser, projectController.createProject)
router.get('/:id', authMiddleware.authUser, projectController.getProjectById)
router.put('/:id', authMiddleware.authUser, projectController.updateProject)
router.delete('/:id', authMiddleware.authUser, projectController.deleteProject)

module.exports = router;