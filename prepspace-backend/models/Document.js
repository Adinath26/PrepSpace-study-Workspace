const mongoose = require("mongoose");

const ChunkSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    // Path relative to the server root, e.g. "/uploads/<uuid>.pdf".
    fileUrl: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
      select: false, // internal filesystem path, not needed by the client
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    extractedText: {
      type: String,
      default: "",
      select: false, // large — only load when explicitly needed for AI context
    },
    chunks: {
      type: [ChunkSchema],
      default: [],
      select: false,
    },
    textExtractionStatus: {
      type: String,
      enum: ["pending", "success", "empty", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
