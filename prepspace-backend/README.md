# PrepSpace — Backend

Express + MongoDB + Gemini API backend for PrepSpace, built to satisfy the exact contract
defined by the PrepSpace frontend (`apiPaths.js`, the `src/services/*` files, and its README).

## 1. Setup

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY at minimum
npm run dev             # nodemon, auto-restarts on change
# or
npm start                # plain node
```

The API listens on `http://localhost:5000` by default (`PORT` in `.env`) and expects
MongoDB to be reachable at `MONGODB_URI`. A quick local option:

```bash
docker run -d -p 27017:27017 --name prepspace-mongo mongo:7
```

Get a Gemini API key at https://aistudio.google.com/app/apikey and put it in
`GEMINI_API_KEY`. Everything except `/api/ai/*` works without it.

## 2. Project structure

```
config/
├── db.js            Mongoose connection
└── multer.js         Disk storage + PDF-only file filter for uploads

models/                One Mongoose schema per collection
├── User.js             bcrypt-hashed passwords, never returned by default
├── Notebook.js
├── Document.js          extractedText/chunks are `select:false` (loaded only when needed)
├── ChatHistory.js       one conversation per (user, document) thread, messages[] embedded
├── Flashcard.js         a saved, titled set of {question, answer} cards
└── Quiz.js              questions[] + a `lastAttempt` (score/breakdown) subdocument

controllers/            One file per resource; all business logic + ownership checks live here
routes/                  Thin Express routers — wire paths to controllers behind `protect`
middleware/
├── auth.js               verifies the JWT, attaches req.user
├── errorHandler.js        maps thrown errors (incl. Mongoose/Multer) to clean JSON + status codes
└── uploadValidation.js     confirms a file + notebookId arrived after multer runs

utils/
├── pdfParser.js           pdf-parse wrapper → { text, pageCount, status }
├── textChunker.js          splits text into overlapping chunks + a keyword-overlap
│                            "pick the most relevant chunks for this question" selector
│                            (a pragmatic retrieval step — no vector DB needed for V1)
├── geminiService.js         the ONLY file that touches @google/generative-ai; exposes
│                             generateChatReply / generateFlashcards / generateQuiz
├── asyncHandler.js          wraps async route handlers so thrown errors reach errorHandler
└── ApiError.js               small Error subclass carrying an HTTP status code

uploads/                   PDF storage for local/dev (served at /uploads/<file>)
server.js                   app wiring: middleware → routes → error handlers → listen
```

## 3. Authentication

- `POST /api/auth/register` and `POST /api/auth/login` return `{ user, token }`.
- The token is a JWT (`{ id: userId }`, signed with `JWT_SECRET`, `JWT_EXPIRES_IN` lifetime).
- `middleware/auth.js` (`protect`) verifies `Authorization: Bearer <token>` on every private
  route, loads the user, and sets `req.user = { id, name, email }`.
- **Every** query in every controller scopes by `userId: req.user.id` — e.g.
  `Document.findOne({ _id, userId: req.user.id })`, never `findById` alone — so one user can
  never read or modify another user's notebooks, documents, chats, flashcards, or quizzes.
- Notebook/document ownership is also re-verified before any AI or file operation
  (e.g. you can't generate flashcards for a document you don't own, even with a valid token).

## 4. The AI Study Mode pipeline

```
PDF upload
   → Multer (disk storage, PDF-only, size-limited)
   → pdfParser.extractTextFromPdf()      (pdf-parse)
   → textChunker.chunkText()              (~1500-char overlapping chunks)
   → stored on the Document (extractedText, chunks)

Chat question
   → verify document ownership
   → textChunker.selectRelevantChunks()   (keyword-overlap ranking — no vector DB in V1)
   → geminiService.generateChatReply({ documentTitle, documentContext, history, question })
   → append {role:"user"} + {role:"assistant"} to the ChatHistory, save
   → { reply, conversationId }
```

Flashcards/quiz generation follow the same ownership + context pattern, but hand Gemini a
larger slice of the document's extracted text (no chunk selection needed — the whole point is
covering the material broadly) and ask for strict JSON output, which `geminiService.js` parses
defensively (stripping code fences, validating shape) before it ever reaches a controller.

Scanned/image-only PDFs: `pdf-parse` can't OCR, so `Document.textExtractionStatus` is marked
`"empty"` when almost no text comes back. The AI endpoints still work — Gemini is simply told
there's no material and will say so rather than hallucinate. OCR is a natural V2 addition
(swap `pdfParser.js` internals; nothing else needs to change).

## 5. API reference

All private routes require `Authorization: Bearer <token>`.

### Auth
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/register` | `{name,email,password}` | `{user,token}` |
| POST | `/api/auth/login` | `{email,password}` | `{user,token}` |
| GET | `/api/auth/me` | — | `{user}` |

### Notebooks
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/notebooks` | — | `{notebooks}` (each with `documentCount`) |
| POST | `/api/notebooks` | `{name,description?,color?}` | `{notebook}` |
| GET | `/api/notebooks/:id` | — | `{notebook}` |
| PUT | `/api/notebooks/:id` | any of `{name,description,color}` | `{notebook}` |
| DELETE | `/api/notebooks/:id` | — | cascades: deletes its documents (+ files), chat history, flashcards, quizzes |

### Documents
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/documents?notebookId=` | — | `{documents}` |
| POST | `/api/documents` | multipart: `file, notebookId, title` | `{document}` |
| GET | `/api/documents/:id` | — | `{document}` |
| PUT | `/api/documents/:id` | `{title}` | `{document}` |
| DELETE | `/api/documents/:id` | — | cascades: deletes the file + its chat/flashcards/quizzes |

### AI (generation only — nothing is saved until you call the CRUD endpoints below)
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/ai/chat` | `{documentId,message,conversationId?}` | `{reply,conversationId}` |
| POST | `/api/ai/flashcards` | `{documentId,count?}` | `{flashcards:[{question,answer}]}` |
| POST | `/api/ai/quiz` | `{documentId,count?,difficulty?}` | `{quiz:{questions:[...]}}` |

### Flashcards (persisted sets)
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/flashcards?documentId=` | — | `{flashcardSets}` |
| GET | `/api/flashcards/:id` | — | `{flashcardSet}` |
| POST | `/api/flashcards` | `{documentId,title?,cards}` | `{flashcardSet}` |
| PUT | `/api/flashcards/:id` | `{title?,cards?}` | `{flashcardSet}` |
| DELETE | `/api/flashcards/:id` | — | `{message}` |

### Quizzes
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/quizzes?documentId=` | — | `{quizzes}` |
| GET | `/api/quizzes/:id` | — | `{quiz}` |
| POST | `/api/quizzes` | `{documentId,title?,questions}` | `{quiz}` |
| POST | `/api/quizzes/:id/submit` | `{answers:[{questionId,selectedOption}]}` | `{result:{score,total,breakdown}}` |
| GET | `/api/quizzes/:id/results` | — | `{result:{score,total,breakdown}}` (most recent attempt) |

Scoring always happens server-side against the stored `correctAnswer` for each question —
the client never sends (or can influence) the score directly.

## 6. Error format

Every error response is `{ "message": "human-readable message" }` (plus a `stack` field
outside production) with an appropriate status code: `400` bad input, `401` auth,
`404` not found, `409` conflict (e.g. duplicate email), `413`/`400` file too large,
`502` the AI provider failed, `500` everything else. See `middleware/errorHandler.js`.

## 7. Security notes

- Passwords are hashed with bcrypt (`models/User.js`); the field is `select:false` and never
  serialized back to the client.
- File uploads are restricted to `application/pdf` + a `.pdf` extension by `config/multer.js`,
  size-capped via `MAX_UPLOAD_MB`, and written under a server-generated UUID filename — the
  client's original filename is stored only as metadata, never used as a path.
- Every resource lookup includes `userId: req.user.id` in the query itself, not just an
  after-the-fact check, so authorization can't be bypassed by guessing another user's id.

## 8. Suggested build order (matches how this backend was implemented)

1. `server.js` + `config/db.js` + `models/User.js` + auth controller/routes/middleware
2. `models/Notebook.js` + notebook CRUD
3. `models/Document.js` + Multer + `pdfParser.js` + document upload/list/get/delete
4. `textChunker.js` + `models/ChatHistory.js` + `geminiService.js` + `/api/ai/chat`
5. `models/Flashcard.js` / `models/Quiz.js` + their generation + CRUD endpoints
6. Hardening: validation, error handling, cascade deletes (all included above)
