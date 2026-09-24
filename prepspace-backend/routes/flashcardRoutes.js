const express = require("express");
const {
  listFlashcardSets,
  getFlashcardSet,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
} = require("../controllers/flashcardController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(listFlashcardSets).post(createFlashcardSet);
router.route("/:id").get(getFlashcardSet).put(updateFlashcardSet).delete(deleteFlashcardSet);

module.exports = router;
