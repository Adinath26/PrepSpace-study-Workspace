const fs = require("fs");
const Document = require("../models/Document");
const Notebook = require("../models/Notebook");
const ChatHistory = require("../models/ChatHistory");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { extractTextFromPdf } = require("../utils/pdfParser");
const { chunkText } = require("../utils/textChunker");

// GET /api/documents?notebookId=...
const listDocuments = asyncHandler(async (req, res) => {
  const filter = { userId: req.user.id };
  if (req.query.notebookId) filter.notebookId = req.query.notebookId;

  const documents = await Document.find(filter).sort("-createdAt");
  res.status(200).json({ documents });
});

// POST /api/documents  (multipart: file, notebookId, title)
const createDocument = asyncHandler(async (req, res) => {
  const { notebookId, title } = req.body;
  const file = req.file;

  // Confirm the notebook exists and belongs to this user before we let them
  // attach a file to it.
  const notebook = await Notebook.findOne({ _id: notebookId, userId: req.user.id });
  if (!notebook) {
    if (file) fs.unlink(file.path, () => {});
    throw new ApiError(404, "That notebook doesn't exist.");
  }

  // Parse the PDF once at upload time so every later AI request is fast.
  const { text, status } = await extractTextFromPdf(file.path);
  const chunks = chunkText(text);

  const document = await Document.create({
    userId: req.user.id,
    notebookId,
    title: (title || file.originalname).trim().slice(0, 120),
    originalFileName: file.originalname,
    fileUrl: `/uploads/${file.filename}`,
    storagePath: file.path,
    fileSize: file.size,
    mimeType: file.mimetype,
    extractedText: text,
    chunks,
    textExtractionStatus: status,
  });

  // Don't leak internal fields / the full extracted text back to the client.
  const safeDoc = document.toObject();
  delete safeDoc.extractedText;
  delete safeDoc.chunks;
  delete safeDoc.storagePath;

  res.status(201).json({ document: safeDoc });
});

// GET /api/documents/:id
const getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
  if (!document) {
    throw new ApiError(404, "Document not found.");
  }
  res.status(200).json({ document });
});

// PUT /api/documents/:id
const updateDocument = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const updates = {};
  if (title !== undefined) {
    if (!title.trim()) throw new ApiError(400, "Title can't be empty.");
    updates.title = title.trim().slice(0, 120);
  }

  const document = await Document.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    updates,
    { new: true, runValidators: true }
  );

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }
  res.status(200).json({ document });
});

// DELETE /api/documents/:id
// Cascades: removes the stored PDF from disk and any chat history,
// flashcard sets, or quizzes generated from this document.
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.user.id }).select(
    "+storagePath"
  );
  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  await Promise.all([
    ChatHistory.deleteMany({ documentId: document._id }),
    Flashcard.deleteMany({ documentId: document._id }),
    Quiz.deleteMany({ documentId: document._id }),
  ]);

  if (document.storagePath && fs.existsSync(document.storagePath)) {
    fs.unlink(document.storagePath, () => {});
  }

  await document.deleteOne();
  res.status(200).json({ message: "Resource deleted." });
});

module.exports = { listDocuments, createDocument, getDocument, updateDocument, deleteDocument };
