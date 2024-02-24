const userSchema = require("../models/userSchema");
const categoryModal = require('../models/catagory')
const productModal = require('../models/products');
const orderModal = require('../models/orders');
const addressModal = require('../models/adress')
const path = require('path');
const fs = require('fs')
const bycrypt = require('bcrypt');
const dotEnv = require('dotenv');
const options = { day: '2-digit', month: 'short', year: 'numeric' };

//admin page rendering
const adminPage = async (req, res) => {
    try {
        let count = 0;
        res.render('admin/dashboard', { admin: req.session.admin, home: 'home', count })
    } catch (err) {
        console.log(err.message + '     admin first route');
    }
}


//userList page rendering
const users = async (req, res) => {
    try {

        const limit = 4;
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;
        const totalProductsCount = await userSchema.countDocuments({ is_admin: 0 });
        const totalPages = Math.ceil(totalProductsCount / limit);

        const users = await userSchema.find({ is_admin: 0, isDeleted: false })
            .skip(skip)
            .limit(limit);

        res.render('admin/userList', { admin: req.session.admin, users, user: 'user' , currentPage: page, totalPages})

    } catch (err) {
        console.log(err.message + '     users add route')
    }
}


// user remove
const userdlt = async (req, res) => {
    try {

        const dltUser = await userSchema.findOneAndUpdate(
            { _id: req.query.id },
            { $set: { isDeleted: true } }
        );

        if (dltUser) {
            res.send({ success: true, message: 'User deleted successfully' });
        } else {
            res.send({ success: false, message: 'Unable to delete user' });
        }
       
       
    } catch (err) {
        console.log(err.message + '        user delete')
        res.send({ success: false, message: 'An error occurred while deleting user' });
    }
}

//is block or not fetching
const blockFetch = async (req, res) => {
    try {
        const blockornot = await userSchema.findOne({ _id: req.body.payload })

        if (blockornot.is_block) {
            const blockTrue = await userSchema.findOneAndUpdate({ _id: req.body.payload }, { $set: { is_block: false } })

            if (blockTrue._id) {

                const updatedData = await userSchema.findOne({ _id: blockTrue._id });

                return res.send({ updatedData, blocked: 'is blocked' });
            }
        } else {
            const blockTrue = await userSchema.findOneAndUpdate({ _id: req.body.payload }, { $set: { is_block: true } })

            if (blockTrue._id) {

                const updatedData = await userSchema.findOne({ _id: blockTrue._id });

                return res.send({ updatedData });
            }
        }

    } catch (err) {
        console.log(err.message + '       bloack fetching data')
    }
}

//catgory Add page rendering
const catgoryAdd = async (req, res) => {
    try {
        res.render('admin/catagory', { admin: req.session.admin, categoryAdd: true })
    } catch (err) {
        console.log(err.message + '       catgory route ')
    }
}

//get catagory add 
const getcatgoryAdd = async (req, res) => {
    try {
        const category = await categoryModal.create({
            name: req.body.name,
            listed: req.body.active,
        })
        if (category) {
            res.redirect('/admin/catagory')
        }
        else {
            res.send('something issue there')
        }
    } catch (err) {
        console.log(err.message + '          getting category  ')
    }
}

//category dets page rendering
const category = async (req, res) => {
    try {
        const limit = 5;
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;
        const totalCategoryCount = await categoryModal.countDocuments({});
      
        const totalPages = Math.ceil(totalCategoryCount / limit);

        const categorys = await categoryModal.find({isDeleted: false})
            .skip(skip)
            .limit(limit);
        
        if (categorys) {
            res.render('admin/catagoryDet', { categorys, admin: req.session.admin, category: true , totalPages, currentPage: page})
        }
    } catch (er) {
        console.log(er.message + '    category dets ')
    }
}

// catgory fetch 
const categoryFetch = async (req, res) => {
    try {
        const name = await categoryModal.findOne({ name: req.body.name })
        
        if (name) {
            res.send({ exist: true })
        } else {
            res.send({ exist: false })
        }
    } catch (err) {
        console.log(err.message + '     category fetch route ')
    }
}

const categorydlt = async (req, res) => {
    try {
        const dltCat = await categoryModal.findOneAndUpdate(
            { _id: req.query.id },
            { $set: { isDeleted: true } }
        );

        if (dltCat) {
            res.send({ success: true, message: 'Category deleted successfully' });
        } else {
            res.send('Unable to delete the category');
        }
    } catch (err) {
        console.log(err.message + '        categorydlt');
        res.send('An error occurred while deleting the category');
    }
}


//category 
const catgoryActive = async (req, res) => {
    try {
        
        const activeornot = await categoryModal.findOne({ _id: req.body.payload })
        
        if (activeornot.listed) {
            const activetrue = await categoryModal.findOneAndUpdate({ _id: req.body.payload }, { $set: { listed: false } })

            if (activetrue._id) {

                const updatedData = await categoryModal.findOne({ _id: activetrue._id });

                res.send({ updatedData, blocked: 'is blocked' });
            }
        } else {
            const activetrue = await categoryModal.findOneAndUpdate({ _id: req.body.payload }, { $set: { listed: true } })

            if (activetrue._id) {

                const updatedData = await categoryModal.findOne({ _id: activetrue._id });

                res.send({ updatedData });
            }
        }

    } catch (err) {
        console.log(err.message + '       category listed')
    }
}

const productListed = async (req, res) => {
    try {
        const listedornot = await productModal.findOne({ _id: req.body.payload })
       
        if (listedornot.listed) {
            const listtrue = await productModal.findOneAndUpdate({ _id: req.body.payload }, { $set: { listed: false } })

            if (listtrue._id) {

                const updatedData = await productModal.findOne({ _id: listtrue._id });

                res.send({ updatedData, blocked: 'is blocked' });
            }
        } else {
            const listtrue = await productModal.findOneAndUpdate({ _id: req.body.payload }, { $set: { listed: true } })


            if (listtrue._id) {

                const updatedData = await productModal.findOne({ _id: listtrue._id });

                res.send({ updatedData });
            }
        }

    } catch (err) {
        console.log(err.message + '       product listed')
    }
}



// product add page
const productAdd = async (req, res) => {
    try {
        const category = await categoryModal.find({listed:true, isDeleted: false})
        res.render('admin/productAdd', { admin: req.session.admin, productAdd: 'prod', categoryList: category });
    } catch (err) {
        console.log(err.message + '     productadd route ')
    }
}


//getting product details
const getproduct = async (req, res) => {
    try {
        let imgeArray = [];
        const images = req.files;
        images.forEach((file) => {
            imgeArray.push(file.filename);
        });

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        
        const category_id = await categoryModal.findOne({ name: req.body.category });

        const tags = req.body.tags.split(',').map(tag => tag.trim());

        const product = await productModal.create({
            name: req.body.name,
            description: req.body.des,
            price: req.body.price,
            category: category_id,
            createdAt: formattedDate,
            status: req.body.active,
            stock: req.body.stock,
            images: imgeArray,
            color: req.body.color,
            tags: tags 
        });

        res.redirect('/admin/product');
    } catch (err) {
        console.log(err.message + '         product add');
    }
};


//product dets page rendering
const productDets = async (req, res) => {
    try {

        const limit = 5;
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;

        const totalProductsCount = await productModal.countDocuments({});
      
        const totalPages = Math.ceil(totalProductsCount / limit);

        const products = await productModal.find({ isDeleted: false})
            .populate('category')
            .skip(skip)
            .limit(limit);
        const ca = await categoryModal.find({})
        res.render('admin/products', { admin: req.session.admin, product: products, ca , currentPage: page, totalPages});
    } catch (err) {
        console.log(err.message + '        product dets showing page err')
    }
}

//product edit page 
const editProduct = async (req, res) => {
    try {
        const elementsToRemove = req.body.pe;
        const result = await productModal.findOne({ _id: req.query.id })
        let rem = false
        if (typeof (elementsToRemove) == 'object') {

            var oldData = await productModal.findOneAndUpdate(
                { _id: req.query.id },
                { $pull: { images: { $in: elementsToRemove } } },
                { new: true }
            );
            rem = true
        } else {
            var oldData = await productModal.findOneAndUpdate(
                { _id: req.query.id },
                { $pull: { images: elementsToRemove } },
                { new: true }
            );

        }
        
        const category_id = await categoryModal.findOne({ name: req.body.category })
        let flag = 0;
        if (req.files.images0) {
            flag++;
        } if (req.files.images1) {
            flag++;
        }
        if (req.files.images2) {
            flag++;
        }

        let imgeArray = [];
        if (flag !== 0) {

            for (let i = 0; i < flag; i++) {

                if (i == 0) {
                    if (req.files.images0) {
                        let imge0 = req.files.images0
                        imgeArray[i] = imge0[0].filename;
                        
                        flag++;
                        continue;

                    } else {
                        if (oldData.images[0]) {
                            if (req.body.pe0) {
                                console.log(req.body.pe0 + 'first')
                                flag++;
                                continue;
                            } else {

                                console.log(oldData.images[0] + 'first')
                                imgeArray[i] = oldData.images[0]

                                flag++;
                            }
                        } else {

                            flag++;
                        }
                    }

                } else if (i == 1) {
                    if (req.files.images1) {
                        console.log('second')
                        let imge1 = req.files.images1
                        imgeArray[i] = imge1[0].filename;
                        if (oldData.images[1]) {
                            const imagePath = path.join(__dirname, '../public/productImage', oldData.images[1]);
                            if (fs.existsSync(imagePath)) {
                                fs.unlinkSync(imagePath);

                            }
                        }
                        flag++;
                        continue;

                    } else {
                        if (oldData.images[1]) {
                            if (req.body.pe1) {

                                flag++;
                                continue;
                            } else {

                                console.log(oldData.images[1] + 'second')
                                imgeArray[i] = oldData.images[1]

                                flag++;
                            }
                        } else {
                            flag++;
                        }
                    }

                } else if (i == 2) {
                    if (req.files.images2) {
                        let imge2 = req.files.images2
                        imgeArray[i] = imge2[0].filename;
                        if (oldData.images[2]) {
                            const imagePath = path.join(__dirname, '../public/productImage', oldData.images[2]);
                            if (fs.existsSync(imagePath)) {
                                fs.unlinkSync(imagePath);

                            }
                        }

                    } else {
                        if (oldData.images[2]) {

                            imgeArray[i] = oldData.images[2];
                        }
                        if (oldData.images[1] && req.body.pe1) {
                            imgeArray[1] = oldData.images[1]
                        }

                    }
                }

            }
        } else {
            oldData.images.forEach(e => {

                imgeArray.push(e)
            })
        }
        const newArray = imgeArray.filter(Boolean);

        const done = await productModal.findOneAndUpdate({ _id: req.query.id }, { $set: { name: req.body.name, price: req.body.price, stock: req.body.stock, category: category_id, images: newArray } })
        if (done) {
            
            res.redirect('/admin/product');
        } else {

            res.send("Hi")
        }

    } catch (err) {
        console.log(err.message + '      edit product routr')
    }

}

// dlt product 
const dltPro = async (req, res) => {
    try {
        const delPro = await productModal.findOneAndUpdate(
            { _id: req.query.id },
            { $set: { isDeleted: true } }
        );
        if (delPro) {
            res.send({ success: true, message: 'Product deleted successfully' });
            // res.redirect('/admin/product');
        } else {
            res.send('Unable to delete the product');
        }
    } catch (err) {
        console.log(err.message + '       dlt product');
        res.send('An error occurred while deleting the product');
    }
}

//order 
const order = async (req, res) => {
    try {

        const limit = 5;
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;
        const totalOrderCount = await orderModal.countDocuments({});
      
        const totalPages = Math.ceil(totalOrderCount / limit);

        const orderList = await orderModal.find({})
            .populate('userId')
            .skip(skip)
            .limit(limit);

        if (orderList) {
            res.render('admin/orderDets', { admin: req.session.admin, order: true, orderList , totalPages, currentPage: page})
        }
    } catch (err) {
        console.log(err.message + '   admin order page rendering route ')
    }
}

//order view
const orderView = async (req, res) => {
    try {
        if (req.params.id) {
            const orderList = await orderModal.findOne({ _id: req.params.id }).populate('OrderedItems.productId userId')
            res.render('admin/order', { admin: req.session.admin, order: true, orderList })
        } else {
            res.redirect('admin/orders')
        }
    } catch (err) {
        console.log(err.message + '     order view ')
    }
}


//remove order product
const removeorder = async (req, res) => {
    try {
        const removeorder = await orderModal.findByIdAndUpdate({ _id: req.body.id }, { $pull: { OrderedItems: { productId: req.body.pro } } })
        if (removeorder) {
            res.send({ succes: true })
        }
    } catch (err) {
        console.log(err.message + '    removeorder')
    }
}
//remove order 
const removeordeFull = async (req, res) => {
    try {
        const removeorder = await orderModal.findByIdAndDelete({ _id: req.body.id })
        console.log(removeorder)
        if (removeorder) {
            res.send({ succes: true })
        }
    } catch (err) {
        console.log(err.message + '    removeorder')
    }
}

//orderProstatus
const orderProstatus = async (req, res) => {
    try {
        await orderModal.findOneAndUpdate({ _id: req.body.id, 'OrderedItems.productId': req.body.proId }, { $set: { 'OrderedItems.$.orderProStatus': req.body.val } })
    } catch (err) {
        console.log(err.message + ' orderProstatus')
    }
}

module.exports = {
    adminPage,
    productAdd,
    users,
    userdlt,
    blockFetch,
    catgoryAdd,
    productDets,
    category,
    categoryFetch,
    getcatgoryAdd,
    categorydlt,
    catgoryActive,
    getproduct,
    editProduct,
    dltPro,
    productListed,
    order,
    removeorder,
    orderView,
    removeordeFull,
    orderProstatus,
}