require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const notebookRoutes = require("./routes/notebookRoutes");
const documentRoutes = require("./routes/documentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

// --- Core middleware -------------------------------------------------------

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Serve uploaded PDFs statically so `fileUrl: "/uploads/<name>.pdf"` resolves
// directly against this server's origin, matching what PdfViewer.jsx expects.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Health check ------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "prepspace-backend" });
});

// --- API routes --------------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/notebooks", notebookRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quizzes", quizRoutes);

// --- Error handling (must be last) --------------------------------------

app.use(notFound);
app.use(errorHandler);

// --- Boot ----------------------------------------------------------------

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[server] PrepSpace API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
  }
};

start();

module.exports = app;
