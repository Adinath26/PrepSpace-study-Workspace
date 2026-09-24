const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: true }
);

const FlashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    cards: {
      type: [CardSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "A flashcard set needs at least one card.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flashcard", FlashcardSchema);
