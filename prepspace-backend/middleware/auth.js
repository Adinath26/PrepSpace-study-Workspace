const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

/**
 * Verifies the Authorization: Bearer <JWT> header, loads the user, and
 * attaches { id, name, email } to req.user for downstream controllers.
 * Every private route in the app should sit behind this middleware.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "You must be signed in to do that.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "This account no longer exists.");
  }

  req.user = { id: user._id.toString(), name: user.name, email: user.email };
  next();
});

module.exports = { protect };
