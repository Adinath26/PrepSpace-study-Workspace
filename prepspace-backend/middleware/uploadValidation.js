const ApiError = require("../utils/ApiError");

/**
 * Runs after Multer has processed the multipart request. Multer's fileFilter
 * already rejects non-PDF mimetypes, but this gives us one place to check
 * that a file actually arrived and that required form fields are present,
 * with clear error messages instead of a confusing downstream 500.
 */
const requireUploadedFile = (req, res, next) => {
  if (!req.file) {
    throw new ApiError(400, "Attach a PDF file to upload.");
  }
  if (!req.body.notebookId) {
    throw new ApiError(400, "notebookId is required.");
  }
  next();
};

module.exports = { requireUploadedFile };
