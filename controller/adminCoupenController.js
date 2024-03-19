const coupenSchema = require('../models/coupen');
const userSchema = require('../models/userSchema');
const coupenId = require('../config/coupenId');
const path = require('path');
const fs = require('fs');

const coupenPage = async (req, res) => {
    const coupen = await coupenSchema.find({}) || [];

    res.render('admin/coupen', { admin: req.session.admin, coupen , coupens: true});
}

const addCoupen = async (req, res) => {
    try {
        let id = coupenId.generateRandomId();
        let flag = 0;
        while (flag == 1) {
            let data = await coupenSchema.findOneAndDelete({ ID: id });

            if (!data) {
                flag = 1;
            } else {
                id = coupenId.generateRandomId()
            }
        }
        const coupen1 = await coupenSchema.create({
            name: req.body.name,
            offer: req.body.offer,
            from: req.body.from,
            to: req.body.to,
            ID: id,
            image: req.files[0].filename
        });

        console.log(coupen1);

        const coupenSet = await userSchema.updateMany(
            { },
            {
                $push: {
                    coupens: {
                        ID: id,
                        coupenId: coupen1._id
                    }
                }
            }
        );

        if (coupen1) {
            res.redirect('/admin/coupen');
        } else {
            res.send('something wrong');
        }

    } catch (err) {
        console.log(err.message + 'addCoupen route');
    }
}

const coupenRemove = async (req, res) => {
    try {
        const coupen = await coupenSchema.findOneAndDelete({ _id: req.params.id });
        const imagePath = path.join(__dirname, '../public/productImage', coupen.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        if (coupen) {
            res.send({ set: true })
        }
    } catch (err) {
        console.log(err.message + ' coupenRemove route');
    }
}

const coupenEdit = async (req, res) => {
    try {
        const coupen = await coupenSchema.findOne({ _id: req.params.id });
        const image = req.files[0].filename || coupen.image;
        console.log(image);
        const coupenNew = await coupenSchema.findOneAndUpdate({ _id: req.params.id }, {
            $set: {
                name: req.body.name,
                offer: req.body.offer,
                from: req.body.from,
                to: req.body.to,
                image: image
            }
        });
        if (req.files[0]) {
            const imagePath = path.join(__dirname, '../public/productImage', coupen.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        if (coupenNew) {
            res.redirect('/admin/coupen');
        } else {
            res.send('something issue');
        }
    } catch (err) {
        console.log(err.message + 'coupen Edit route');
    }
}

module.exports = {
    coupenPage,
    addCoupen,
    coupenRemove,
    coupenEdit
}