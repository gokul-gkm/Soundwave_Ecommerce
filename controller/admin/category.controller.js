const Category = require("../../models/catagory");

/**
 * @desc    Render Add Category Page
 * @route   GET /admin/categories/new
 */
const getAddCategoryPage = async (req, res) => {
  try {
    res.render("admin/catagory", {
      admin: req.session.admin,
      categoryAdd: true,
    });
  } catch (err) {
    console.log(err.message + "       catgory route ");
  }
};

/**
 * @desc    Create New Category
 * @route   POST /admin/categories
 */
const createCategory = async (req, res) => {
    try {
    const { name, active } = req.body;
    const exists = await Category.findOne({ name });

    if (exists) {
      return res.status(400).send("Category already exists");
    }
    const category = await Category.create({
      name,
      listed: active,
    });
    if (category) {
      res.redirect("/admin/categories");
    } else {
      res.send("something issue there");
    }
  } catch (err) {
    console.log(err.message + "          getting category  ");
  }
};

/**
 * @desc    Get Categories (Paginated)
 * @route   GET /admin/categories
 */
const getCategories = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const totalCategoryCount = await Category.countDocuments({});

    const totalPages = Math.ceil(totalCategoryCount / limit);

    const categorys = await Category
      .find({ isDeleted: false })
      .skip(skip)
      .limit(limit);

    if (categorys) {
      res.render("admin/catagoryDet", {
        categorys,
        admin: req.session.admin,
        category: true,
        totalPages,
        currentPage: page,
      });
    }
  } catch (er) {
    console.log(er.message + "    category dets ");
  }
};

/**
 * @desc    Check Category Exists (AJAX)
 * @route   POST /admin/categories/check
 */
const checkCategoryExists = async (req, res) => {
  try {
    const name = await Category.findOne({ name: req.body.name });

    if (name) {
      res.send({ exist: true });
    } else {
      res.send({ exist: false });
    }
  } catch (err) {
    console.log(err.message + "     category fetch route ");
  }
};

/**
 * @desc    Soft Delete Category
 * @route   DELETE /admin/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const dltCat = await Category.findOneAndUpdate(
      { _id: categoryId },
      { $set: { isDeleted: true } }
    );

    if (dltCat) {
      res.send({ success: true, message: "Category deleted successfully" });
    } else {
      res.send("Unable to delete the category");
    }
  } catch (err) {
    console.log(err.message + "        categorydlt");
    res.send("An error occurred while deleting the category");
  }
};

/**
 * @desc    Toggle Category Active Status
 * @route   PATCH /admin/categories/:id/status
 */
const toggleCategoryStatus = async (req, res) => {
    try {
    const categoryId = req.params.id;
    const activeornot = await Category.findOne({ _id: categoryId });

    if (activeornot.listed) {
      const activetrue = await Category.findOneAndUpdate(
        { _id: categoryId },
        { $set: { listed: false } }
      );

      if (activetrue._id) {
        const updatedData = await Category.findOne({
          _id: activetrue._id,
        });

        res.send({ updatedData, blocked: "is blocked" });
      }
    } else {
      const activetrue = await Category.findOneAndUpdate(
        { _id: categoryId },
        { $set: { listed: true } }
      );

      if (activetrue._id) {
        const updatedData = await Category.findOne({
          _id: activetrue._id,
        });

        res.send({ updatedData });
      }
    }
  } catch (err) {
    console.log(err.message + "       category listed");
  }
};

module.exports = {
  getAddCategoryPage,
  createCategory,
  getCategories,
  checkCategoryExists,
  deleteCategory,
  toggleCategoryStatus,
};
