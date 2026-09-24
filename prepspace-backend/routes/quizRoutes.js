const express = require("express");
const {
  listQuizzes,
  getQuiz,
  createQuiz,
  submitQuiz,
  getQuizResults,
} = require("../controllers/quizController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(listQuizzes).post(createQuiz);
router.get("/:id", getQuiz);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", getQuizResults);

module.exports = router;
