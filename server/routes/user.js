const express = require('express')
const router = express.Router()

//import middleware
const { requireSignin, authMiddleware, adminMiddleware } = require('../controllers/auth')

//import validator
const { userUpdateValidator } = require('../validators/auth')
const { runValidation } = require('../validators')

//import from controllers
const { read, update } = require('../controllers/user')

router.get('/user', requireSignin, authMiddleware, read)
router.get('/admin', requireSignin, adminMiddleware, read)
router.put('/user', userUpdateValidator, runValidation, requireSignin, authMiddleware, update)

module.exports = router