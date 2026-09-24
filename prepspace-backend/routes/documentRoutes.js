const express = require("express");
const {
  listDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
} = require("../controllers/documentController");
const { protect } = require("../middleware/auth");
const { upload } = require("../config/multer");
const { requireUploadedFile } = require("../middleware/uploadValidation");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(listDocuments)
  .post(upload.single("file"), requireUploadedFile, createDocument);

router.route("/:id").get(getDocument).put(updateDocument).delete(deleteDocument);

module.exports = router;
