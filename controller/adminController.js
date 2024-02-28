//admin page rendering
const adminPage = async (req, res) => {
    try {
        let count = 0;
        res.render('admin/dashboard', { admin: req.session.admin, home: 'home', count })
    } catch (err) {
        console.log(err.message + '     admin first route');
    }
}


module.exports = {
    adminPage,
}