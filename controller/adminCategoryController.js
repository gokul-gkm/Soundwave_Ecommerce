const categoryModal = require("../models/catagory");

//catgory Add page rendering
const catgoryAdd = async (req, res) => {
  try {
    res.render("admin/catagory", {
      admin: req.session.admin,
      categoryAdd: true,
    });
  } catch (err) {
    console.log(err.message + "       catgory route ");
  }
};

//get catagory add
const getcatgoryAdd = async (req, res) => {
  try {
    const category = await categoryModal.create({
      name: req.body.name,
      listed: req.body.active,
    });
    if (category) {
      res.redirect("/admin/catagory");
    } else {
      res.send("something issue there");
    }
  } catch (err) {
    console.log(err.message + "          getting category  ");
  }
};

//category dets page rendering
const category = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const totalCategoryCount = await categoryModal.countDocuments({});

    const totalPages = Math.ceil(totalCategoryCount / limit);

    const categorys = await categoryModal
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

// catgory fetch
const categoryFetch = async (req, res) => {
  try {
    const name = await categoryModal.findOne({ name: req.body.name });

    if (name) {
      res.send({ exist: true });
    } else {
      res.send({ exist: false });
    }
  } catch (err) {
    console.log(err.message + "     category fetch route ");
  }
};

const categorydlt = async (req, res) => {
  try {
    const dltCat = await categoryModal.findOneAndUpdate(
      { _id: req.query.id },
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

//category
const catgoryActive = async (req, res) => {
  try {
    const activeornot = await categoryModal.findOne({ _id: req.body.payload });

    if (activeornot.listed) {
      const activetrue = await categoryModal.findOneAndUpdate(
        { _id: req.body.payload },
        { $set: { listed: false } }
      );

      if (activetrue._id) {
        const updatedData = await categoryModal.findOne({
          _id: activetrue._id,
        });

        res.send({ updatedData, blocked: "is blocked" });
      }
    } else {
      const activetrue = await categoryModal.findOneAndUpdate(
        { _id: req.body.payload },
        { $set: { listed: true } }
      );

      if (activetrue._id) {
        const updatedData = await categoryModal.findOne({
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
  catgoryAdd,
  category,
  categoryFetch,
  getcatgoryAdd,
  categorydlt,
  catgoryActive,
};
