const coupenSchema = require("../../models/coupen");
const userSchema = require("../../models/userSchema");
const coupenId = require("../../config/coupenId");
const { cloudinary } = require("../../config/cloudinary");
const { getPublicId } = require("../../utils/cloudinaryHelper");

const coupenPage = async (req, res) => {
  const coupen = (await coupenSchema.find({})) || [];

  res.render("admin/coupen", {
    admin: req.session.admin,
    coupen,
    coupens: true,
  });
};

const addCoupen = async (req, res) => {
  try {
    let id = coupenId.generateRandomId();
    let flag = 0;
    while (flag == 1) {
      let data = await coupenSchema.findOneAndDelete({ ID: id });

      if (!data) {
        flag = 1;
      } else {
        id = coupenId.generateRandomId();
      }
    }
    
    const imagePath = req.files && req.files[0] ? req.files[0].path : null;

    const coupen1 = await coupenSchema.create({
      name: req.body.name,
      offer: req.body.offer,
      from: req.body.from,
      to: req.body.to,
      ID: id,
      image: imagePath,
    });

    console.log(coupen1);

    const coupenSet = await userSchema.updateMany(
      {},
      {
        $push: {
          coupens: {
            ID: id,
            coupenId: coupen1._id,
          },
        },
      }
    );

    if (coupen1) {
      res.redirect("/admin/coupen");
    } else {
      res.send("something wrong");
    }
  } catch (err) {
    console.log(err.message + "addCoupen route");
  }
};

const coupenRemove = async (req, res) => {
  try {
    const coupen = await coupenSchema.findOneAndDelete({ _id: req.params.id });
    
    if (coupen && coupen.image) {
      try {
        const publicId = getPublicId(coupen.image);
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error(`Failed to delete coupon image from Cloudinary: ${coupen.image}`, error);
      }
    }

    if (coupen) {
      res.send({ set: true });
    }
  } catch (err) {
    console.log(err.message + " coupenRemove route");
  }
};

const coupenEdit = async (req, res) => {
  try {
    const coupen = await coupenSchema.findOne({ _id: req.params.id });
    let image = coupen.image;

    if (req.files && req.files[0]) {
      image = req.files[0].path;
      
      // Delete old image from Cloudinary
      if (coupen.image) {
        try {
          const publicId = getPublicId(coupen.image);
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error(`Failed to delete old coupon image: ${coupen.image}`, error);
        }
      }
    }

    const coupenNew = await coupenSchema.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          offer: req.body.offer,
          from: req.body.from,
          to: req.body.to,
          image: image,
        },
      }
    );

    if (coupenNew) {
      res.redirect("/admin/coupen");
    } else {
      res.send("something issue");
    }
  } catch (err) {
    console.log(err.message + "coupen Edit route");
  }
};

module.exports = {
  coupenPage,
  addCoupen,
  coupenRemove,
  coupenEdit,
};

