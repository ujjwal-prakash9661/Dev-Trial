const express = require('express')
const authController = require('../controllers/auth.controller')

const router = express.Router()

router.get('/github', authController.githubLogin)
router.get('/github/callback', authController.githubCallBack)
router.post('/logout', authController.logout)

router.get('/me', authController.getMe)

module.exports = router