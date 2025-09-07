const express = require('express');
const authMiddleware = require('../middleware/auth.middleware')
const teamController = require('../controllers/team.controller')

const router = express.Router()

router.post('/', authMiddleware.authUser, teamController.createTeam)
router.get('/', authMiddleware.authUser, teamController.getTeams)
router.get('/:id', authMiddleware.authUser, teamController.getTeamById)
router.put('/:id', authMiddleware.authUser, teamController.updateTeam)
router.delete('/:id', authMiddleware.authUser, teamController.deleteTeam)

module.exports = router;