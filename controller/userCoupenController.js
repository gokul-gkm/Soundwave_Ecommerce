const categoryModal = require("../models/catagory");
const userSchema = require("../models/userSchema");


//coupenView
const coupenView = async (req, res) => {
    try {
        const category = await categoryModal.find({})
        const coupen = await userSchema.findOne({ _id: req.session.login }).populate('coupens.coupenId')
        console.log(coupen);
        console.log("hiiii");
        res.render('client/coupen', { login: req.session.login, coupen: coupen.coupens, category })
    } catch (err) {
        console.log(err.message + '     coupenView')
    }
  }
  
  //coupenCode
  const coupenCode = async (req, res) => {
    try {
        const hh = req.body.id.trim()
        const id = String(hh)
        const dataExist = await userSchema.findOne({ _id: req.params.id, 'coupens.ID': id }).populate("coupens.coupenId");
        req.session.coupenId = id
        let offer;
        dataExist.coupens.forEach((e) => {
            if (e.ID == id) {
                offer = e.coupenId.offer
            }
        })
        req.session.offer = offer
        if (dataExist) {
            res.redirect('/checkoutPage')
        } else {
            req.flash('msg', "coupen did'nt exist")
            res.redirect('/cart')
        }
    } catch (err) {
        console.log(err.message + ' coupenCode')
    }
}
  
module.exports = {
    coupenView,
    coupenCode
}