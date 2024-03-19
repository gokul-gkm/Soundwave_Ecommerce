const offerSchema = require('../models/offer');
const productModal = require('../models/products');

const offerPage = async (req, res) => {
    try {
        const offer = await offerSchema.find({})
        res.render('admin/offer', { admin: req.session.admin, offer , offers: true});
        
    } catch (err) {
        console.log(err.message+ '  offer page');
    }
}

const addOfferPage = async (req, res) => {
    try {
        res.render('admin/addOffer',{admin: req.session.admin, creat:'offer', offers: true})
    } catch (err) {
        
    }
}

const offerCreating = async (req, res) => {
    try {
        const offerCreate = await offerSchema.create({
            name: req.body.name,
            offer: req.body.offer
        })
        if (offerCreate) {
            res.redirect('/admin/offer');
        } else {
            res.send("Something issue there. offer didn't created")
        }
    } catch (err) {
        console.log(err.message+ ' offer creating');
    }
}

const offerEdit = async (req, res) => {
    try {
        const data = await offerSchema.findOne({ _id: req.params.id });
        res.render('admin/addOffer', { admin: req.session.admin, edit: 'offeredit', data, id: data._id , offers: true});       
    } catch (err) {
        console.log(err.message+ "offer Edit page");
    }

}
const getOfferEdit = async (req, res) => {
    try {
        const { name, offer } = req.body;
        const data = await offerSchema.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { name, offer } }
        );
        res.redirect('/admin/offer');
    } catch (err) {
        console.log(err.message+'getofferEdit');
    }
}

const offerRemove = async (req, res) => {
    try {
        const products = await productModal.find({ offer: req.params.id });
        products.forEach(async (e) => {
            await productModal.findOneAndUpdate(
                { _id: e._id },
                { $unset: { offer: '' }, $set: { price: e.actualPrice } }
            );
        })
        const done = await offerSchema.findOneAndDelete({ _id: req.params.id });
        res.redirect('/admin/offer');      
    } catch (err) {
        console.log(err.message+'offer Remove');
    }
}


const offerProduct = async (req, res) => {

    try {
        const limit = 5;
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;
        const totalProductsCount = await productModal.countDocuments({});   
        const totalPages = Math.ceil(totalProductsCount / limit);

        const offer = await offerSchema.findOne({ _id: req.params.id });
        const product = await productModal.find({})
            .skip(skip)
            .limit(limit);;

        res.render('admin/offerProduct', {admin: req.session.admin, product, id: req.params.id, offer: offer.offer, offers: true,  currentPage: page, totalPages})
    } catch (err) {
        console.log(err.message+ 'offer product');
    }
}

const offerProductAdd = async (req, res) => {
    try {
        await offerSchema.findOne({ _id: req.params.id });
        if (req.body.add) {
            const data = await productModal.findOne({ _id: req.body.id });
            const offerPrice = (data.price / 100 * (100 - req.body.offer)).toFixed(2);
            await productModal.findOneAndUpdate({ _id: req.body.id }, { $set: { offer: req.params.id, price: offerPrice } });
        } else {
            const data = await productModal.findOne({ _id: req.body.id });
            await productModal.findOneAndUpdate({_id: req.body.id}, {$unset: {offer: 1}, $set: {price: data.actualPrice}})
        }
    } catch (err) {
        console.log(err.message+ 'offerProductAdd');
    }
}

module.exports = {
    offerPage,
    addOfferPage,
    offerCreating,
    offerEdit,
    getOfferEdit,
    offerRemove,
    offerProduct,
    offerProductAdd
}