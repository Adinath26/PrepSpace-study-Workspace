const Quiz = require("../models/Quiz");
const Document = require("../models/Document");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/quizzes?documentId=...
const listQuizzes = asyncHandler(async (req, res) => {
  const filter = { userId: req.user.id };
  if (req.query.documentId) filter.documentId = req.query.documentId;

  const quizzes = await Quiz.find(filter).sort("-createdAt");
  res.status(200).json({ quizzes });
});

// GET /api/quizzes/:id
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
  if (!quiz) {
    throw new ApiError(404, "Quiz not found.");
  }
  res.status(200).json({ quiz });
});

// POST /api/quizzes — persists a set of questions (usually just generated via /api/ai/quiz)
const createQuiz = asyncHandler(async (req, res) => {
  const { documentId, title, questions } = req.body;

  if (!documentId || !Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "documentId and a non-empty questions array are required.");
  }

  const document = await Document.findOne({ _id: documentId, userId: req.user.id });
  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  const cleanQuestions = questions
    .filter((q) => q && (q.prompt || q.question) && Array.isArray(q.options) && q.correctAnswer)
    .map((q) => ({
      prompt: String(q.prompt || q.question),
      options: q.options.map((opt, i) =>
        typeof opt === "string"
          ? { key: String.fromCharCode(65 + i), text: opt }
          : { key: opt.key || String.fromCharCode(65 + i), text: opt.text }
      ),
      correctAnswer: String(q.correctAnswer),
      explanation: q.explanation ? String(q.explanation) : "",
    }));

  if (cleanQuestions.length === 0) {
    throw new ApiError(400, "Each question needs a prompt, options, and a correctAnswer.");
  }

  const quiz = await Quiz.create({
    userId: req.user.id,
    documentId,
    title: title?.trim() || `${document.title} — Quiz`,
    questions: cleanQuestions,
  });

  res.status(201).json({ quiz });
});

// Builds the graded breakdown for a set of submitted answers against a quiz's
// stored correct answers. Shared by submit + results so both stay consistent.
function buildBreakdown(quiz, answers) {
  const answerMap = new Map(answers.map((a) => [String(a.questionId), a.selectedOption]));

  let score = 0;
  const breakdown = quiz.questions.map((q) => {
    const questionId = q._id.toString();
    const selectedOption = answerMap.get(questionId) ?? null;
    const correct = selectedOption === q.correctAnswer;
    if (correct) score += 1;
    return {
      questionId,
      prompt: q.prompt,
      correct,
      selectedOption,
      correctAnswer: q.correctAnswer,
    };
  });

  return { score, total: quiz.questions.length, breakdown };
}

// POST /api/quizzes/:id/submit
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new ApiError(400, "answers must be a non-empty array of {questionId, selectedOption}.");
  }

  const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
  if (!quiz) {
    throw new ApiError(404, "Quiz not found.");
  }

  const { score, total, breakdown } = buildBreakdown(quiz, answers);

  quiz.lastAttempt = {
    answers: answers.map((a) => ({
      questionId: String(a.questionId),
      selectedOption: a.selectedOption,
    })),
    score,
    total,
    breakdown,
    submittedAt: new Date(),
  };
  await quiz.save();

  res.status(200).json({ result: { score, total, breakdown } });
});

// GET /api/quizzes/:id/results — the most recent attempt, if any.
const getQuizResults = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
  if (!quiz) {
    throw new ApiError(404, "Quiz not found.");
  }
  if (!quiz.lastAttempt) {
    throw new ApiError(404, "You haven't attempted this quiz yet.");
  }

  const { score, total, breakdown } = quiz.lastAttempt;
  res.status(200).json({ result: { score, total, breakdown } });
});

module.exports = { listQuizzes, getQuiz, createQuiz, submitQuiz, getQuizResults };
