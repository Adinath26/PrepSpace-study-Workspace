const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // "A", "B", "C", "D"...
    text: { type: String, required: true },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: {
    type: [OptionSchema],
    validate: {
      validator: (arr) => arr.length >= 2,
      message: "Each question needs at least two options.",
    },
  },
  correctAnswer: { type: String, required: true }, // matches an option's `key`
  explanation: { type: String, default: "" },
});

const BreakdownItemSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    prompt: { type: String, required: true },
    correct: { type: Boolean, required: true },
    selectedOption: { type: String, default: null },
    correctAnswer: { type: String, required: true },
  },
  { _id: false }
);

const AttemptSchema = new mongoose.Schema(
  {
    answers: [
      {
        questionId: String,
        selectedOption: String,
        _id: false,
      },
    ],
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    breakdown: { type: [BreakdownItemSchema], default: [] },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const QuizSchema = new mongoose.Schema(
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
    questions: {
      type: [QuestionSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "A quiz needs at least one question.",
      },
    },
    lastAttempt: {
      type: AttemptSchema,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
