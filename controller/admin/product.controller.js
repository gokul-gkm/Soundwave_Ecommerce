const Product = require("../../models/products");
const Category = require("../../models/catagory");
const Review = require("../../models/reviews");
const { cloudinary } = require("../../config/cloudinary");
const { getPublicId } = require("../../utils/cloudinaryHelper");
const options = { day: "2-digit", month: "short", year: "numeric" };

/**
 * @desc Render Product Page
 */
const getProducts = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalProductsCount = await Product.countDocuments({});

    const totalPages = Math.ceil(totalProductsCount / limit);

    const products = await Product
      .find({ isDeleted: false })
      .populate("category")
      .skip(skip)
      .limit(limit);
    const ca = await Category.find({});
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

/**
 * @desc Render Add Product Page
 */
const getCreateProductPage = async (req, res) => {
  try {
    const category = await Category.find({
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

/**
 * @desc Create Product
 */
const createProduct = async (req, res) => {
  try {
    let imgeArray = [];
    const images = req.files;
    images.forEach((file) => {
      imgeArray.push(file.path);
    });

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-US", options);

    const category_id = await Category.findOne({
      name: req.body.category,
    });

    const tags = req.body.tags.split(",").map((tag) => tag.trim());

    const product = await Product.create({
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

    res.redirect("/admin/products");
  } catch (err) {
    console.log(err.message + "         product add");
  }
};



/**
 * @desc Update Product
 */
const updateProduct = async (req, res) => {
  try {
      const productId = req.params.id;
      console.log("productId: ",productId);
    const elementsToRemove = req.body.pe;
    const currentProduct = await Product.findOne({ _id: productId });
    
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
      
      await Product.findOneAndUpdate(
        { _id: productId },
        { $pull: { images: { $in: imagesToDelete } } },
        { new: true }
      );
    }

    const updatedOldData = await Product.findOne({ _id: productId });
    const category_id = await Category.findOne({
      name: req.body.category,
    });

    let imgeArray = [];
    const files = req.files;

    for (let i = 0; i < 3; i++) {
        const fileKey = `images${i}`;
        if (files[fileKey]) {
            imgeArray[i] = files[fileKey][0].path;
            
            if (updatedOldData.images[i]) {
                try {
                    const publicId = getPublicId(updatedOldData.images[i]);
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error(`Failed to delete old image: ${updatedOldData.images[i]}`, error);
                }
            }
        } else {
            if (updatedOldData.images[i]) {
                imgeArray[i] = updatedOldData.images[i];
            }
        }
    }

    const newArray = imgeArray.filter(Boolean);

    const done = await Product.findOneAndUpdate(
      { _id: productId },
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
        console.log("✅Updated")
      res.redirect("/admin/products");
    } else {
        console.log("❌Update failed")
      res.send("Update failed");
    }
  } catch (err) {
    console.log(err.message + "      edit product route");
  }
};

/**
 * @desc Delete Product
 */
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId });
    
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

    const delPro = await Product.findOneAndUpdate(
      { _id: productId },
      { $set: { isDeleted: true, images: [] } }
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

/**
 * @desc Toggle Product Status
 */
const toggleProductStatus = async (req, res) => {
  try {
    const productId = req.params.id;
    const listedornot = await Product.findOne({ _id: productId });

    if (listedornot.listed) {
      const listtrue = await Product.findOneAndUpdate(
        { _id: productId },
        { $set: { listed: false } }
      );

      if (listtrue._id) {
        const updatedData = await Product.findOne({ _id: listtrue._id });

        res.send({ updatedData, blocked: "is blocked" });
      }
    } else {
      const listtrue = await Product.findOneAndUpdate(
        { _id: productId },
        { $set: { listed: true } }
      );

      if (listtrue._id) {
        const updatedData = await Product.findOne({ _id: listtrue._id });

        res.send({ updatedData });
      }
    }
  } catch (err) {
    console.log(err.message + "       product listed");
  }
};

/**
 * @desc Get Product Details by ID
 */
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId, isDeleted: false })
      .populate("category")
      .populate("offer");

    if (!product) {
      return res.redirect("/admin/products");
    }

    const reviews = await Review.find({ productId: productId }).populate("userId");
    const categories = await Category.find({ listed: true, isDeleted: false });

    res.render("admin/productDetails", {
      admin: req.session.admin,
      product,
      reviews,
      categories,
    });
  } catch (err) {
    console.log(err.message + "    product details page");
    res.redirect("/admin/products");
  }
};

module.exports = {
  getProducts,
  getCreateProductPage,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductById,
};
