const jwt = require("jsonwebtoken");
const { getConfig } = require("./config");
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token)
    return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(token, getConfig().jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (
      !req.user ||
      (!roles.includes(req.user.role) &&
        !(req.user.role === "BOTH" && roles.length))
    )
      return res.status(403).json({ error: "Insufficient permissions" });
    next();
  };
}
function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.statusCode || (error.code === "23505" ? 409 : 500);
  if (status >= 500) console.error(error);
  res
    .status(status)
    .json({ error: status >= 500 ? "Internal server error" : error.message });
}
module.exports = {
  asyncHandler,
  requireAuth,
  requireRole,
  createHttpError,
  errorHandler,
};
