const { GoogleGenerativeAI } = require("@google/generative-ai");
const ApiError = require("./ApiError");

let client = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(
      500,
      "The AI assistant isn't configured yet (missing GEMINI_API_KEY on the server)."
    );
  }
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

function getModel(overrides = {}) {
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  return getClient().getGenerativeModel({ model: modelName, ...overrides });
}

const SYSTEM_INSTRUCTION =
  "You are PrepSpace's study assistant. Answer using the supplied study material as your " +
  "primary source of truth. Be clear and concise, use simple language suited to a student " +
  "revising for exams, and format answers with short paragraphs or bullet points where it " +
  "helps. If the study material doesn't cover something the student asks, say so plainly " +
  "rather than inventing information.";

/**
 * Strips ```json fences and any stray prose Gemini sometimes wraps around
 * JSON output, then parses it. Throws a friendly ApiError if parsing fails.
 */
function parseJsonResponse(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  const start = cleaned.indexOf(cleaned.trimStart()[0] === "[" ? "[" : "{");
  const end = cleaned.trimStart()[0] === "[" ? cleaned.lastIndexOf("]") : cleaned.lastIndexOf("}");
  const slice = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;

  try {
    return JSON.parse(slice);
  } catch (err) {
    console.error("[geminiService] Failed to parse JSON from Gemini:", raw);
    throw new ApiError(502, "The AI assistant returned an unexpected response. Please try again.");
  }
}

/**
 * Answers a student's question about a document, grounded in the supplied
 * context and recent conversation history.
 */
async function generateChatReply({ documentTitle, documentContext, history = [], question }) {
  const model = getModel({ systemInstruction: SYSTEM_INSTRUCTION });

  const historyText = history
    .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = [
    `DOCUMENT: "${documentTitle}"`,
    "",
    "RELEVANT CONTENT FROM THE DOCUMENT:",
    documentContext || "(No extractable text was found for this document.)",
    "",
    historyText ? "RECENT CONVERSATION:\n" + historyText : "",
    "",
    `STUDENT QUESTION:\n${question}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (!text) throw new Error("Empty response");
    return text;
  } catch (err) {
    console.error("[geminiService] chat generation failed:", err.message);
    throw new ApiError(502, "The AI assistant couldn't answer that just now. Please try again.");
  }
}

/**
 * Generates `count` question/answer flashcards grounded in the document context.
 * Returns an array of { question, answer }.
 */
async function generateFlashcards({ documentTitle, documentContext, count = 10 }) {
  const model = getModel({ systemInstruction: SYSTEM_INSTRUCTION });

  const prompt = [
    `Create exactly ${count} exam-revision flashcards from the study material below,`,
    `taken from the document "${documentTitle}".`,
    "Each flashcard should test one clear concept, term, or fact.",
    "Respond with ONLY a JSON array, no commentary, in this exact shape:",
    `[{"question": "...", "answer": "..."}]`,
    "",
    "STUDY MATERIAL:",
    documentContext || "(No extractable text was found for this document.)",
  ].join("\n");

  try {
    const result = await model.generateContent(prompt);
    const parsed = parseJsonResponse(result.response.text());
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Gemini returned no flashcards");
    }
    return parsed
      .filter((c) => c && c.question && c.answer)
      .map((c) => ({ question: String(c.question), answer: String(c.answer) }));
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("[geminiService] flashcard generation failed:", err.message);
    throw new ApiError(502, "Couldn't generate flashcards right now. Please try again.");
  }
}

const OPTION_KEYS = ["A", "B", "C", "D", "E", "F"];

/**
 * Generates `count` multiple-choice questions grounded in the document context.
 * Returns an array of { prompt, options: [{key, text}], correctAnswer, explanation }.
 */
async function generateQuiz({ documentTitle, documentContext, count = 10, difficulty = "medium" }) {
  const model = getModel({ systemInstruction: SYSTEM_INSTRUCTION });

  const prompt = [
    `Create exactly ${count} multiple-choice quiz questions at ${difficulty} difficulty`,
    `from the study material below, taken from the document "${documentTitle}".`,
    "Each question needs 4 plausible options with exactly one correct answer.",
    "Respond with ONLY a JSON array, no commentary, in this exact shape:",
    `[{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0, "explanation": "..."}]`,
    '"correctIndex" is the zero-based index into "options" of the correct answer.',
    "",
    "STUDY MATERIAL:",
    documentContext || "(No extractable text was found for this document.)",
  ].join("\n");

  try {
    const result = await model.generateContent(prompt);
    const parsed = parseJsonResponse(result.response.text());
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Gemini returned no quiz questions");
    }

    return parsed
      .filter((q) => q && q.question && Array.isArray(q.options) && q.options.length >= 2)
      .map((q) => {
        const options = q.options.slice(0, OPTION_KEYS.length).map((text, i) => ({
          key: OPTION_KEYS[i],
          text: String(text),
        }));
        const correctIdx = Number.isInteger(q.correctIndex) ? q.correctIndex : 0;
        const correctAnswer = OPTION_KEYS[Math.min(correctIdx, options.length - 1)];
        return {
          prompt: String(q.question),
          options,
          correctAnswer,
          explanation: q.explanation ? String(q.explanation) : "",
        };
      });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("[geminiService] quiz generation failed:", err.message);
    throw new ApiError(502, "Couldn't generate a quiz right now. Please try again.");
  }
}

module.exports = { generateChatReply, generateFlashcards, generateQuiz };
