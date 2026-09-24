const express = require("express");
const { chat, flashcards, quiz } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/chat", chat);
router.post("/flashcards", flashcards);
router.post("/quiz", quiz);

module.exports = router;
