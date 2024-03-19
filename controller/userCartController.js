
const categoryModal = require("../models/catagory");
const cartModal = require("../models/cart");
const productModal = require("../models/products");


//cart 
const cart = async (req, res) => {
    try {
      const cart = await cartModal
        .findOne({ userId: req.session.login })
        .populate("products.productId");
  
      console.log(cart);
      if (cart) {
        const total = cart.products.reduce(
          (acc, product) => acc + product.price,
          0
        );  
        const options = {
          upsert: true,
          new: true,
        };
        const totalPriceAdding = await cartModal
          .findOneAndUpdate(
            { userId: req.session.login },
            { $set: { TotalPrice: total } },
            options
          )
          .exec();
        const category = await categoryModal.find({});
        res.render("client/cart", {
          login: req.session.login,
          cart,
          totalprice: totalPriceAdding.TotalPrice,
          category,
        });
      } else {
        const category = await categoryModal.find({});
        res.render("client/cart", {
          login: req.session.login,
          totalprice: 0,
          category,
        });
      }
    } catch (err) {
      console.log(err.message + "      cart page route");
    }
  };
  
  // add cart fetching
  const addcart = async (req, res) => {
    try {
      const product = await productModal.findOne({ _id: req.body.id });
      const result = await cartModal
        .findOne({
          userId: req.body.user,
          products: {
            $elemMatch: {
              productId: req.body.id,
            },
          },
        })
        .exec();
      if (!result) {
        const tp = product.price * req.body.q;
  
        const filter = { userId: req.body.user };
        const update = {
          $set: {
            userId: req.body.user,
          },
          $addToSet: {
            products: { productId: req.body.id, price: tp },
          },
        };
        const options = {
          upsert: true,
          new: true,
        };
  
        const cartSuccess = await cartModal
          .findOneAndUpdate(filter, update, options)
          .exec();
  
        if (cartSuccess) {
          res.send({ success: "succes" });
        }
      } else {
        res.send({ exist: "it is already exist" });
      }
    } catch (err) {
      console.log(err.message + "      addCart put fecth routre");
    }
  };
  
  // add cart on post requiset
  const addcartPost = async (req, res) => {
    try {
      if (req.query.user) {
        const product = await productModal.findOne({ _id: req.query.id });
        const result = await cartModal
          .findOne({
            userId: req.query.user,
            products: {
              $elemMatch: {
                productId: req.query.id,
              },
            },
          })
          .exec();
       
        if (!result) {
          
          const tp = product.price * req.body.q;
  
          const filter = { userId: req.query.user };
          const update = {
            $set: {
              userId: req.query.user,
            },
            $addToSet: {
              products: {
                productId: req.query.id,
                price: tp,
                quantity: req.body.q,
              },
            },
          };
          const options = {
            upsert: true,
            new: true,
          };
  
          const cartSuccess = await cartModal
            .findOneAndUpdate(filter, update, options)
            .exec();
  
          if (cartSuccess) {
            res.redirect(`/cart?id=${req.query.user}`);
          }
        } else {
          const tp = product.price * req.body.q;
          const updatedCart = await cartModal.findOneAndUpdate(
            { userId: req.query.user, "products.productId": req.query.id },
            {
              $set: {
                "products.$.price": tp,
                "products.$.quantity": req.body.q,
              },
            },
            { new: true }
          );
          if (updatedCart) {
            res.redirect(`/cart?id=${req.query.user}`);
          } else {
            res.send("somthing issues");
          }
        }
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      console.log(err.message + "    addcartpost route");
    }
  };
  
  //edit cart fetch
  const cartEdit = async (req, res) => {
    try {
      const product = await productModal.findOne({ _id: req.body.i });
      const newval = product.price * req.body.quantity;
  
      const updatedCart = await cartModal.findOneAndUpdate(
        { _id: req.body.id, "products.productId": req.body.i },
        {
          $set: {
            "products.$.price": newval,
            "products.$.quantity": req.body.quantity,
          },
        },
        { new: true }
      );
      console.log(updatedCart);
  
      const total = updatedCart.products.reduce(
        (acc, product) => acc + product.price,
        0
      );
  
      await cartModal.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { TotalPrice: total } }
      );
  
      res.send({ su: total });
    } catch (err) {
      console.log(err.message + "   cart edit ");
    }
  };
  
  //cart remove
  const cartree = async (req, res) => {
    try {
      console.log(req.body.tot);
      const remove = await cartModal.updateOne(
        { _id: req.body.id },
        {
          $set: { TotalPrice: req.body.tot },
          $pull: { products: { productId: req.body.proid } },
        }
      );
      if (remove.modifiedCount === 0) {
      } else {
        const rdata = await cartModal.findOne({ _id: req.body.id });
        console.log(rdata);
        res.send({ rdata });
      }
    } catch (err) {
      console.log(err.message + "   catrreeee");
    }
};

  
module.exports = {
    cart,
    addcart,
    cartEdit,
    cartree,
    addcartPost,
};
