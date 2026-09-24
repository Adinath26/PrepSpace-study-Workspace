const DEFAULT_CHUNK_SIZE = 1500; // characters
const DEFAULT_OVERLAP = 200; // characters shared between consecutive chunks

/**
 * Splits long text into overlapping chunks so we never have to send an
 * entire document to Gemini for a single question. Splitting on paragraph
 * boundaries where possible keeps chunks readable.
 */
function chunkText(text, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) {
  const clean = (text || "").replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);

    // Try to break on a paragraph or sentence boundary near the target end
    // so we don't cut a sentence in half.
    if (end < clean.length) {
      const paragraphBreak = clean.lastIndexOf("\n\n", end);
      const sentenceBreak = clean.lastIndexOf(". ", end);
      const boundary = Math.max(paragraphBreak, sentenceBreak);
      if (boundary > start + chunkSize * 0.5) {
        end = boundary + 1;
      }
    }

    const chunk = clean.slice(start, end).trim();
    if (chunk) {
      chunks.push({ index, text: chunk });
      index += 1;
    }

    if (end >= clean.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are",
  "was", "were", "be", "been", "with", "as", "by", "at", "from", "that",
  "this", "it", "its", "what", "how", "why", "explain", "define", "describe",
]);

const tokenize = (str) =>
  (str.toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => w.length > 2 && !STOPWORDS.has(w));

/**
 * Ranks chunks by simple keyword overlap with the question and returns the
 * top N joined together. This is a pragmatic V1 retrieval step — good enough
 * for single-document study assistance without standing up a vector database.
 * Swap this out for embeddings + a vector store later without touching callers.
 */
function selectRelevantChunks(chunks, question, { maxChunks = 4, maxChars = 6000 } = {}) {
  if (!chunks || chunks.length === 0) return "";

  const questionWords = new Set(tokenize(question));

  const scored = chunks.map((c) => {
    const words = tokenize(c.text);
    let score = 0;
    for (const w of words) {
      if (questionWords.has(w)) score += 1;
    }
    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  // If nothing scored (generic question like "summarize this"), fall back to
  // the document's opening chunks, which usually carry the most context.
  const hasSignal = scored.some((c) => c.score > 0);
  const picked = (hasSignal ? scored.slice(0, maxChunks) : chunks.slice(0, maxChunks)).sort(
    (a, b) => a.index - b.index
  );

  let context = "";
  for (const c of picked) {
    if (context.length + c.text.length > maxChars) break;
    context += (context ? "\n\n---\n\n" : "") + c.text;
  }
  return context;
}

module.exports = { chunkText, selectRelevantChunks };
