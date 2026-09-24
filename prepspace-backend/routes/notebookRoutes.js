const express = require("express");
const {
  listNotebooks,
  createNotebook,
  getNotebook,
  updateNotebook,
  deleteNotebook,
} = require("../controllers/notebookController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(listNotebooks).post(createNotebook);
router.route("/:id").get(getNotebook).put(updateNotebook).delete(deleteNotebook);

module.exports = router;
