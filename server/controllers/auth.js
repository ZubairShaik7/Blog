const AWS = require('aws-sdk')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { registerEmailParams, forgotPasswordEmailParams } = require('../helpers/email')
const shortId = require('shortid')
const expressjwt = require('express-jwt')
const _ = require('lodash')
const Link = require('../models/link')

AWS.config.update({
    accessKeyID: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const ses = new AWS.SES({ apiVersion: '2010-12-01' })

exports.register = (req, res) => {
    //console.log('REGISTER CONTROLLER', req.body)
    const { name, email, password } = req.body
    //check if user exists in db
    User.findOne({email}).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            })
        }
        //generate json token with user name email and password
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, {
            expiresIn: '10m'
        })

        const params = registerEmailParams(email, token)

        const sendEmailOnRegister = ses.sendEmail(params).promise()
    
        sendEmailOnRegister
        .then(data => {
            console.log('email submitted to SES', data)
            res.status(200).json({
                message: `Email has been sent to ${email}, Follow the instructions to complete your registration`
            })
        })
        .catch(err => {
            console.log('ses email on register', err)
            res.status(400).json({
                message: `We could not find your email, please try again`
            })
        })
    })
}

exports.registerActivate = (req, res) => {
    const { token } = req.body
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
        if (err) {
            return res.status(401).json({
                error: 'Expired link. Try again'
            })
        }
        const { name, email, password } = jwt.decode(token)
        const username = shortId.generate()
        User.findOne({email}).exec((err, user) => {
            if (user) {
                return res.status(401).json({
                    error: 'Email is taken'
                })
            }
            //register new user
            const newUser = new User({username, name, email, password})
            newUser.save((err, result) => {
                if (err) {
                    return res.status(401).json({
                        error: 'Error saving user in db. Try again'
                    })
                }
                return res.json({
                    message: 'Registration success. Please login'
                })
            })
        })
    })
}

exports.login = (req, res) => {
    const { email, password } = req.body
    User.findOne({email}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please register'
            })
        }
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and password do not match'
            })
        }
        const token = jwt.sign({ _id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})
        const { _id, name, email, role } = user
        return res.status(200).json({
            token,
            user: { _id, name, email, role }
        })
    })
}

exports.requireSignin = expressjwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] })

exports.authMiddleware = (req, res, next) => {
    const userId = req.user._id
    User.findOne({_id: userId}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            })
        }
        req.profile = user
        next()
    })
}

exports.adminMiddleware = (req, res, next) => {
    const userId = req.user._id
    User.findOne({_id: userId}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            })
        }
        if (user.role != 'admin') {
            return res.status(400).json({
                error: 'Admin resource. Access denied'
            })
        }
        req.profile = user
        next()
    })
}

exports.forgotPassword = (req, res) => {
    const { email } = req.body
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist'
            })
        }
        const token = jwt.sign({name: user.name}, process.env.JWT_RESET_PASSWORD, {expiresIn: '10m'})
        const params = forgotPasswordEmailParams(email, token)
        return user.updateOne({resetPasswordLink: token}, (err, success) => {
            if (err) {
                return res.status(400).json({
                    error: 'Password reset failed. Try later'
                })
            }
            const sendEmail = ses.sendEmail(params).promise()
            sendEmail
            .then(data => {
                console.log('ses reset pw success', data)
                return res.json({
                    message: `Email has been sent to ${email}. Click on link to reset password.`
                })
            })
            .catch(error => {
                console.log('ses reset pw failed', error)
                return res.json({
                    message: `We could not verify your email, Try again later.`
                })
            })
        })
    })
}

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body
    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, success) => {
            if (err) {
                return res.status(400).json({
                    error: 'Expired Link. Try again'
                })
            }
            User.findOne({ resetPasswordLink }).exec((err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        error: 'Invalid token. Try later'
                    })
                }
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                }
                user = _.extend(user, updatedFields)
                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Password reset failed. Try later'
                        })
                    }
                    return res.status(200).json({
                        message: 'Password has been reset.'
                    })
                })
            })
        })
    }
}

exports.canUpdateDeleteLink = (req, res, next) => {
    const {id} = req.params
    Link.findOne({_id: id}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not find link'
            })
        }
        let authorizedUser = data.postedBy._id.toString() == req.user._id.toString()
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'You are not authorized'
            })
        }
        next()
    })
}