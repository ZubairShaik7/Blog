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
    Link.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not find links'
            })
        }
        res.json(data)
    })
}

exports.read = (req, res) => {
    
}

exports.update = (req, res) => {
    
}

exports.remove = (req, res) => {
    
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