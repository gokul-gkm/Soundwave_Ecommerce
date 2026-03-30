const productModal = require("../../models/products");
const categoryModal = require("../../models/catagory");
const { cloudinary } = require("../../config/cloudinary");
const { getPublicId } = require("../../utils/cloudinaryHelper");
const options = { day: "2-digit", month: "short", year: "numeric" };


const productListed = async (req, res) => {
  try {
    const listedornot = await productModal.findOne({ _id: req.body.payload });

    if (listedornot.listed) {
      const listtrue = await productModal.findOneAndUpdate(
        { _id: req.body.payload },
        { $set: { listed: false } }
      );

      if (listtrue._id) {
        const updatedData = await productModal.findOne({ _id: listtrue._id });

        res.send({ updatedData, blocked: "is blocked" });
      }
    } else {
      const listtrue = await productModal.findOneAndUpdate(
        { _id: req.body.payload },
        { $set: { listed: true } }
      );

      if (listtrue._id) {
        const updatedData = await productModal.findOne({ _id: listtrue._id });

        res.send({ updatedData });
      }
    }
  } catch (err) {
    console.log(err.message + "       product listed");
  }
};

// product add page
const productAdd = async (req, res) => {
  try {
    const category = await categoryModal.find({
      listed: true,
      isDeleted: false,
    });
    res.render("admin/productAdd", {
      admin: req.session.admin,
      productAdd: "prod",
      categoryList: category,
    });
  } catch (err) {
    console.log(err.message + "     productadd route ");
  }
};

//getting product details
const getproduct = async (req, res) => {
  try {
    let imgeArray = [];
    const images = req.files;
    images.forEach((file) => {
      imgeArray.push(file.path); // Cloudinary URL
    });

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-US", options);

    const category_id = await categoryModal.findOne({
      name: req.body.category,
    });

    const tags = req.body.tags.split(",").map((tag) => tag.trim());

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
      tags: tags,
      actualPrice: req.body.price,
    });

    res.redirect("/admin/product");
  } catch (err) {
    console.log(err.message + "         product add");
  }
};

//product dets page rendering
const productDetails = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalProductsCount = await productModal.countDocuments({});

    const totalPages = Math.ceil(totalProductsCount / limit);

    const products = await productModal
      .find({ isDeleted: false })
      .populate("category")
      .skip(skip)
      .limit(limit);
    const ca = await categoryModal.find({});
    res.render("admin/products", {
      admin: req.session.admin,
      product: products,
      ca,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.log(err.message + "        product dets showing page err");
  }
};

//product edit page
const editProduct = async (req, res) => {
  try {
    const elementsToRemove = req.body.pe;
    const currentProduct = await productModal.findOne({ _id: req.query.id });
    
    // Handle image deletions from Cloudinary for removed images
    if (elementsToRemove) {
      const imagesToDelete = Array.isArray(elementsToRemove) ? elementsToRemove : [elementsToRemove];
      for (const imgUrl of imagesToDelete) {
        try {
          const publicId = getPublicId(imgUrl);
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error(`Failed to delete image from Cloudinary: ${imgUrl}`, error);
        }
      }
      
      await productModal.findOneAndUpdate(
        { _id: req.query.id },
        { $pull: { images: { $in: imagesToDelete } } },
        { new: true }
      );
    }

    const updatedOldData = await productModal.findOne({ _id: req.query.id });
    const category_id = await categoryModal.findOne({
      name: req.body.category,
    });

    let imgeArray = [];
    const files = req.files;

    // Preserve existing images or replace them
    for (let i = 0; i < 3; i++) {
        const fileKey = `images${i}`;
        if (files[fileKey]) {
            // New image uploaded for this slot
            imgeArray[i] = files[fileKey][0].path;
            
            // Delete old image if it existed in this slot
            if (updatedOldData.images[i]) {
                try {
                    const publicId = getPublicId(updatedOldData.images[i]);
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error(`Failed to delete old image: ${updatedOldData.images[i]}`, error);
                }
            }
        } else {
            // Keep old image if not explicitly removed
            if (updatedOldData.images[i]) {
                imgeArray[i] = updatedOldData.images[i];
            }
        }
    }

    const newArray = imgeArray.filter(Boolean);

    const done = await productModal.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          price: req.body.price,
          stock: req.body.stock,
          category: category_id,
          images: newArray,
        },
      }
    );
    if (done) {
      res.redirect("/admin/product");
    } else {
      res.send("Update failed");
    }
  } catch (err) {
    console.log(err.message + "      edit product route");
  }
};

// dlt product
const dltPro = async (req, res) => {
  try {
    const product = await productModal.findOne({ _id: req.query.id });
    
    // Optional: Keep images on soft delete, or delete them if entirely removing.
    // Given the user's request "when delete the product", they likely want Cloudinary cleanup.
    if (product && product.images) {
        for (const imgUrl of product.images) {
            try {
                const publicId = getPublicId(imgUrl);
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error(`Failed to delete image from Cloudinary during product deletion: ${imgUrl}`, error);
            }
        }
    }

    const delPro = await productModal.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { isDeleted: true, images: [] } } // Emptying images after deletion from Cloudinary
    );

    if (delPro) {
      res.send({ success: true, message: "Product deleted successfully" });
    } else {
      res.send("Unable to delete the product");
    }
  } catch (err) {
    console.log(err.message + "       dlt product");
    res.send("An error occurred while deleting the product");
  }
};

module.exports = {
  productAdd,
  productDetails,
  getproduct,
  editProduct,
  dltPro,
  productListed,
};


// module.exports = {
//   productAdd,
//   productDetails,
//   getproduct,
//   editProduct,
//   dltPro,
//   productListed,
// };
