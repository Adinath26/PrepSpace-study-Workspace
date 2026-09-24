const fs = require("fs");
const mongoose = require("mongoose");
const Notebook = require("../models/Notebook");
const Document = require("../models/Document");
const ChatHistory = require("../models/ChatHistory");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/notebooks
const listNotebooks = asyncHandler(async (req, res) => {
  const notebooks = await Notebook.find({ userId: req.user.id }).sort("-createdAt").lean();

  // Attach a resource count per notebook so the dashboard cards don't need a
  // second round trip.
  let countMap = new Map();
  if (notebooks.length) {
    const counts = await Document.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$notebookId", count: { $sum: 1 } } },
    ]);
    countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  }

  const withCounts = notebooks.map((nb) => ({
    ...nb,
    documentCount: countMap.get(String(nb._id)) || 0,
  }));

  res.status(200).json({ notebooks: withCounts });
});

// POST /api/notebooks
const createNotebook = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Notebook name is required.");
  }

  const notebook = await Notebook.create({
    userId: req.user.id, // never trust a client-supplied owner
    name: name.trim(),
    description: description?.trim() || "",
    color: color || "#2F5D50",
  });

  res.status(201).json({ notebook });
});

// GET /api/notebooks/:id
const getNotebook = asyncHandler(async (req, res) => {
  const notebook = await Notebook.findOne({ _id: req.params.id, userId: req.user.id });
  if (!notebook) {
    throw new ApiError(404, "Notebook not found.");
  }
  res.status(200).json({ notebook });
});

// PUT /api/notebooks/:id
const updateNotebook = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;
  const updates = {};
  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, "Notebook name can't be empty.");
    updates.name = name.trim();
  }
  if (description !== undefined) updates.description = description.trim();
  if (color !== undefined) updates.color = color;

  const notebook = await Notebook.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    updates,
    { new: true, runValidators: true }
  );

  if (!notebook) {
    throw new ApiError(404, "Notebook not found.");
  }
  res.status(200).json({ notebook });
});

// DELETE /api/notebooks/:id
// Cascades: deletes every document (and its file on disk), chat history,
// flashcard set, and quiz that belongs to this notebook — no orphans left behind.
const deleteNotebook = asyncHandler(async (req, res) => {
  const notebook = await Notebook.findOne({ _id: req.params.id, userId: req.user.id });
  if (!notebook) {
    throw new ApiError(404, "Notebook not found.");
  }

  const documents = await Document.find({ notebookId: notebook._id, userId: req.user.id }).select(
    "+storagePath"
  );
  const documentIds = documents.map((d) => d._id);

  await Promise.all([
    ChatHistory.deleteMany({ documentId: { $in: documentIds } }),
    Flashcard.deleteMany({ documentId: { $in: documentIds } }),
    Quiz.deleteMany({ documentId: { $in: documentIds } }),
  ]);

  for (const doc of documents) {
    if (doc.storagePath && fs.existsSync(doc.storagePath)) {
      fs.unlink(doc.storagePath, () => {});
    }
  }
  await Document.deleteMany({ notebookId: notebook._id, userId: req.user.id });
  await notebook.deleteOne();

  res.status(200).json({ message: "Notebook and its resources were deleted." });
});

module.exports = { listNotebooks, createNotebook, getNotebook, updateNotebook, deleteNotebook };
