const Category = require('../models/category')
const slugify = require('slugify')
const formidable = require('formidable')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const Link = require('../models/link')

const s3 = new AWS.S3({
    accessKeyID: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

exports.create = (req, res) => {
    const { name, image, content } = req.body;
    // image data
    const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const type = image.split(';')[0].split('/')[1];

    const slug = slugify(name);
    let category = new Category({ name, content, slug });

    const params = {
        Bucket: 'hackr-react-node-aws',
        Key: `category/${uuidv4()}.${type}`,
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.log(err);
            res.status(400).json({ error: 'Upload to s3 failed' });
        }
        console.log('AWS UPLOAD RES DATA', data);
        category.image.url = data.Location;
        category.image.key = data.Key;
        category.postedBy = req.user._id

        // save to db
        category.save((err, success) => {
            if (err) {
                console.log(err);
                res.status(400).json({ error: 'Duplicate category' });
            }
            return res.json(success);
        });
    });
};

// exports.create = (req, res) => {
//     let form = new formidable.IncomingForm()
//     form.parse(req, async (err, fields, files) => {
//         if (err) {
//             return res.status(400).json({
//                 error: 'Image could not be found'
//             })
//         }
//         const { name, content } = fields
//         const { image } = files
//         console.log(name)
//         const slug = slugify(name)
//         let category = new Category({ name, content, slug })
//         if (image.size > 2000000) {
//             return res.status(400).json({
//                 error: 'Image should be less than 2MB'
//             })
//         }
//         const params = {
//             Bucket: 'hackr-react-node-aws',
//             Key: `category/${uuidv4()}`,
//             Body: fs.readFileSync(image.filepath),
//             ACL: 'public-read',
//             ContentType: 'image/jpg'
//         }
//         s3.upload(params, function(err, data) {
//             if (err) {
//                 console.log(err)
//                 return res.status(400).json({
//                     error: 'Upload to S3 failed'
//                 })
//             }
//             category.image.url = data.Location
//             category.image.key = data.Key
//             category.save((err, success) => {
//                 if (err) {
//                     return res.status(400).json({
//                         error: 'Error saving category to DB'
//                     })
//                 }
//                 return res.json(success)
//             })
//         })
//     })
    
// }

exports.list = (req, res) => {
    Category.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: 'Categories could not load'
            })
        }
        res.json(data)
    })    
}

exports.read = (req, res) => {
    const { slug, limit, skip } = req.body

    let limiT = limit ? parseInt(limit) : 10
    let skiP = skip ? parseInt(skip) : 0
    console.log(limiT, skiP)
    Category.findOne({slug})
        .populate('postedBy', '_id name username')
        .exec((err, category) => {
            if (err) {
                return res.status(400).json({
                    error: 'Could not load category'
                })
            }
            Link.find({categories: category})
                .populate('postedBy', '_id name username')
                .populate('categories', 'name')
                .sort({createdAt: -1})
                .limit(limiT)
                .skip(skiP)
                .exec((err, links) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Could not load links of category'
                        })
                    }
                    res.json({ category, links })
                })
        })    
}

exports.update = (req, res) => {


    
}

exports.remove = (req, res) => {


    
}