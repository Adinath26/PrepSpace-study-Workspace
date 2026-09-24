const fs = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Extracts plain text from a PDF file on disk.
 * Returns { text, pageCount, status } where status is:
 *   "success" - text was extracted normally
 *   "empty"   - the PDF parsed but contained little/no extractable text
 *               (typical of a scanned/image-only PDF — OCR is a future enhancement)
 *   "failed"  - the file could not be parsed at all
 */
const MIN_MEANINGFUL_CHARS = 40;

async function extractTextFromPdf(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = (data.text || "").replace(/\u0000/g, "").trim();

    return {
      text,
      pageCount: data.numpages || 0,
      status: text.length >= MIN_MEANINGFUL_CHARS ? "success" : "empty",
    };
  } catch (err) {
    console.error("[pdfParser] Failed to parse PDF:", err.message);
    return { text: "", pageCount: 0, status: "failed" };
  }
}

module.exports = { extractTextFromPdf };
