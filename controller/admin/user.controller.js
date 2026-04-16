const User = require("../../models/userSchema");

/**
 * @desc    Get All Users (Paginated)
 * @route   GET /admin/users
 */
const getUsers = async (req, res) => {
  try {
    const limit = 4;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const totalProductsCount = await User.countDocuments({ is_admin: 0 });
    const totalPages = Math.ceil(totalProductsCount / limit);

    const users = await User
      .find({ is_admin: 0, isDeleted: false })
      .skip(skip)
      .limit(limit);

    res.render("admin/userList", {
      admin: req.session.admin,
      users,
      user: "user",
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.log(err.message + "     users add route");
  }
};

/**
 * @desc    Soft Delete User
 * @route   DELETE /admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const dltUser = await User.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { isDeleted: true } }
    );

    if (dltUser) {
      res.send({ success: true, message: "User deleted successfully" });
    } else {
      res.send({ success: false, message: "Unable to delete user" });
    }
  } catch (err) {
    console.log(err.message + "        user delete");
    res.send({
      success: false,
      message: "An error occurred while deleting user",
    });
  }
};

/**
 * @desc    Toggle Block / Unblock User
 * @route   PATCH /admin/users/:id/block
 */
const toggleUserBlock  = async (req, res) => {
  try {
    const blockornot = await User.findOne({ _id: req.body.payload });

    if (blockornot.is_block) {
      const blockTrue = await User.findOneAndUpdate(
        { _id: req.body.payload },
        { $set: { is_block: false } }
      );

      if (blockTrue._id) {
        const updatedData = await User.findOne({ _id: blockTrue._id });

        return res.send({ updatedData, blocked: "is blocked" });
      }
    } else {
      const blockTrue = await User.findOneAndUpdate(
        { _id: req.body.payload },
        { $set: { is_block: true } }
      );

      if (blockTrue._id) {
        const updatedData = await User.findOne({ _id: blockTrue._id });

        return res.send({ updatedData });
      }
    }
  } catch (err) {
    console.log(err.message + "       bloack fetching data");
  }
};

module.exports = {
  getUsers,
  deleteUser,
  toggleUserBlock,
};
