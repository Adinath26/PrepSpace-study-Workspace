/**
 * Wraps an async Express route handler so rejected promises are forwarded
 * to next(err) automatically, letting the central errorHandler deal with them.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
