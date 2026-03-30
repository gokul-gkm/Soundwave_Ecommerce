/**
 * =========================================================
 *  GLOBAL ERROR HANDLER MIDDLEWARE
 * =========================================================
 */

const errorHandler = (err, req, res, next) => {
  console.error(err); 

  /**
   * Set locals for EJS templates
   */
  res.locals.message = err.message;

  // Show full error only in development
  res.locals.error =
    req.app.get("env") === "development" ? err : {};

  /**
   * Set response status
   */
  const statusCode = err.status || 500;
  res.status(statusCode);

  /**
   * Render error page
   */
  res.render("errorpage");
};

module.exports = errorHandler;