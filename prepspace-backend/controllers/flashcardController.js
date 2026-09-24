const Flashcard = require("../models/Flashcard");
const Document = require("../models/Document");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/flashcards?documentId=...
const listFlashcardSets = asyncHandler(async (req, res) => {
  const filter = { userId: req.user.id };
  if (req.query.documentId) filter.documentId = req.query.documentId;

  const flashcardSets = await Flashcard.find(filter).sort("-createdAt");
  res.status(200).json({ flashcardSets });
});

// GET /api/flashcards/:id
const getFlashcardSet = asyncHandler(async (req, res) => {
  const flashcardSet = await Flashcard.findOne({ _id: req.params.id, userId: req.user.id });
  if (!flashcardSet) {
    throw new ApiError(404, "Flashcard set not found.");
  }
  res.status(200).json({ flashcardSet });
});

// POST /api/flashcards  — persists a set (usually just generated via /api/ai/flashcards)
const createFlashcardSet = asyncHandler(async (req, res) => {
  const { documentId, title, cards } = req.body;

  if (!documentId || !Array.isArray(cards) || cards.length === 0) {
    throw new ApiError(400, "documentId and a non-empty cards array are required.");
  }

  const document = await Document.findOne({ _id: documentId, userId: req.user.id });
  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  const cleanCards = cards
    .filter((c) => c && c.question && c.answer)
    .map((c) => ({ question: String(c.question), answer: String(c.answer) }));

  if (cleanCards.length === 0) {
    throw new ApiError(400, "Each card needs a question and an answer.");
  }

  const flashcardSet = await Flashcard.create({
    userId: req.user.id,
    documentId,
    title: title?.trim() || `${document.title} — Flashcards`,
    cards: cleanCards,
  });

  res.status(201).json({ flashcardSet });
});

// PUT /api/flashcards/:id
const updateFlashcardSet = asyncHandler(async (req, res) => {
  const { title, cards } = req.body;
  const updates = {};
  if (title !== undefined) {
    if (!title.trim()) throw new ApiError(400, "Title can't be empty.");
    updates.title = title.trim();
  }
  if (cards !== undefined) {
    if (!Array.isArray(cards) || cards.length === 0) {
      throw new ApiError(400, "cards must be a non-empty array.");
    }
    updates.cards = cards
      .filter((c) => c && c.question && c.answer)
      .map((c) => ({ question: String(c.question), answer: String(c.answer) }));
  }

  const flashcardSet = await Flashcard.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    updates,
    { new: true, runValidators: true }
  );

  if (!flashcardSet) {
    throw new ApiError(404, "Flashcard set not found.");
  }
  res.status(200).json({ flashcardSet });
});

// DELETE /api/flashcards/:id
const deleteFlashcardSet = asyncHandler(async (req, res) => {
  const flashcardSet = await Flashcard.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!flashcardSet) {
    throw new ApiError(404, "Flashcard set not found.");
  }
  res.status(200).json({ message: "Flashcard set deleted." });
});

module.exports = {
  listFlashcardSets,
  getFlashcardSet,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
};
