/**
 * =========================================================
 *  404 NOT FOUND MIDDLEWARE
 * =========================================================
 */

const notFound = (req, res, next) => {
  res.status(404).redirect("/404");
};

module.exports = notFound;