const userSchema = require("../models/userSchema");

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

module.exports = {  
    users,
    userdlt,
    blockFetch, 
}