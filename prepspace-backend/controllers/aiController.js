const Document = require("../models/Document");
const ChatHistory = require("../models/ChatHistory");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { selectRelevantChunks } = require("../utils/textChunker");
const geminiService = require("../utils/geminiService");

const MAX_HISTORY_MESSAGES = 10; // recent turns kept as conversation context
const FLASHCARD_QUIZ_CONTEXT_CHARS = 9000; // generous window for generation tasks

// Loads a document (with its extracted text/chunks) and verifies ownership.
// Shared by all three AI endpoints below.
async function loadOwnedDocumentWithContent(documentId, userId) {
  const document = await Document.findOne({ _id: documentId, userId }).select(
    "+extractedText +chunks"
  );
  if (!document) {
    throw new ApiError(404, "Document not found.");
  }
  if (document.textExtractionStatus === "failed" || document.textExtractionStatus === "empty") {
    // Not a hard failure — Gemini will just be told there's no material,
    // and can say so. This also covers scanned/image-only PDFs (no OCR in V1).
  }
  return document;
}

// POST /api/ai/chat
const chat = asyncHandler(async (req, res) => {
  const { documentId, message, conversationId } = req.body;

  if (!documentId || !message?.trim()) {
    throw new ApiError(400, "documentId and message are required.");
  }

  const document = await loadOwnedDocumentWithContent(documentId, req.user.id);

  // Find or start the conversation for this document.
  let conversation = null;
  if (conversationId) {
    conversation = await ChatHistory.findOne({
      _id: conversationId,
      documentId,
      userId: req.user.id,
    });
  }
  if (!conversation) {
    conversation = await ChatHistory.create({
      userId: req.user.id,
      documentId,
      messages: [],
    });
  }

  const documentContext = selectRelevantChunks(document.chunks, message, { maxChunks: 4 });
  const recentHistory = conversation.messages.slice(-MAX_HISTORY_MESSAGES);

  const reply = await geminiService.generateChatReply({
    documentTitle: document.title,
    documentContext: documentContext || document.extractedText.slice(0, 4000),
    history: recentHistory,
    question: message.trim(),
  });

  conversation.messages.push(
    { role: "user", content: message.trim() },
    { role: "assistant", content: reply }
  );
  await conversation.save();

  res.status(200).json({ reply, conversationId: conversation._id.toString() });
});

// POST /api/ai/flashcards
const flashcards = asyncHandler(async (req, res) => {
  const { documentId, count } = req.body;

  if (!documentId) {
    throw new ApiError(400, "documentId is required.");
  }

  const document = await loadOwnedDocumentWithContent(documentId, req.user.id);
  const context = document.extractedText.slice(0, FLASHCARD_QUIZ_CONTEXT_CHARS);

  const cards = await geminiService.generateFlashcards({
    documentTitle: document.title,
    documentContext: context,
    count: Math.min(Math.max(Number(count) || 10, 1), 25),
  });

  res.status(200).json({ flashcards: cards });
});

// POST /api/ai/quiz
const quiz = asyncHandler(async (req, res) => {
  const { documentId, count, difficulty } = req.body;

  if (!documentId) {
    throw new ApiError(400, "documentId is required.");
  }

  const document = await loadOwnedDocumentWithContent(documentId, req.user.id);
  const context = document.extractedText.slice(0, FLASHCARD_QUIZ_CONTEXT_CHARS);

  const questions = await geminiService.generateQuiz({
    documentTitle: document.title,
    documentContext: context,
    count: Math.min(Math.max(Number(count) || 10, 1), 25),
    difficulty: ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium",
  });

  res.status(200).json({ quiz: { questions } });
});

module.exports = { chat, flashcards, quiz };
