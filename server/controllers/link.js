const Link = require('../models/link')
const slugify = require('slugify')

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