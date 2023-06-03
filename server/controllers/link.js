const Link = require('../models/link')
const slugify = require('slugify')
const User = require('../models/user')
const Category = require('../models/category')
const { linkPublishedParams } = require('../helpers/email')
const AWS = require('aws-sdk')

AWS.config.update({
    accessKeyID: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const ses = new AWS.SES({ apiVersion: '2010-12-01' })

exports.create = (req, res) => {
    const { title, url, categories, type, medium  } = req.body
    const slug = url
    const clicks = 0
    let link = new Link({ title, url, categories, type, medium, slug, clicks })
    link.postedBy = req.user._id

    link.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: 'Link already exists'
            })
        }
        res.json(data)

        User.find({categories: {$in: categories}}).exec((err, users) => {
            if (err) {
                console.log('Error finding users to send email on link publish')
                throw new Error(rr)
            }
            Category.find({_id: {$in: categories}}).exec((err, result) => {
                if (err) {
                    console.log(err)
                }
                data.categories = result
                for (let i = 0; i < users.length; i++) {
                    const params = linkPublishedParams(users[i].email, data)
                    const sendEmail = ses.sendEmail(params).promise()
                    sendEmail
                        .then(success => {
                            console.log('Email submitted to SES', success)
                            return
                        })
                        .catch(failure => {
                            console.log('error on email submitted to SES', failure)
                            return
                        })
                }
            })
        })
        
    })
}

exports.list = (req, res) => {
    let limiT = req.body.limit ? parseInt(req.body.limit) : 10
    let skiP = req.body.skip ? parseInt(req.body.skip) : 0

    Link.find({})
        .populate('postedBy', 'name')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1})
        .skip(skiP)
        .limit(limiT)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'Could not find links'
                })
            }
            res.json(data)
        })
}

exports.read = (req, res) => {
    const {id} = req.params
    Link.findOne({_id: id}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not find link'
            })
        }
        res.json(data)
    })
}

exports.update = (req, res) => {
    const {id} = req.params
    const {title, url, categories, type, medium} = req.body
    Link.findOneAndUpdate({_id: id}, {title, url, categories, type, medium}, {new: true}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not update link'
            })
        }
        res.json({
            message: 'Link updated successfully'
        })
    })
}

exports.remove = (req, res) => {
    const {id} = req.params
    console.log(id)
    Link.findOneAndRemove({_id: id}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not remove link'
            })
        }
        res.json({
            message: 'Link removed successfully'
        })
    })
}

exports.clickCount = (req, res) => {
    const { linkID } = req.body
    console.log(linkID)
    Link.findByIdAndUpdate(linkID, {$inc: {clicks: 1}}, {upsert: true, new: true}).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not update view count'
            })
        }
        res.json(result)
    })
}

exports.popular = (req, res) => {
    Link.find()
        .populate('postedBy', 'name')
        .sort({clicks: -1})
        .limit(3)
        .exec((err, links) => {
            if (err) {
                return res.status(400).json({
                    error: 'Links not found'
                })
            }
            res.json(links)
        })
}

exports.popularInCategory = (req, res) => {
    const { slug } = req.params
    Category.findOne({slug}).exec((err, category) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not load categories'
            })
        }
        Link.find({categories: category})
            .sort({clicks: -1})
            .limit(3)
            .exec((err, links) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Links not found'
                    })
                }
                res.json(links)
            })
    })
}