# PrepSpace — Frontend

An AI-powered study workspace. Students organize PDFs into subject notebooks, view them
in-browser, and open **AI Study Mode** to ask Gemini-powered, context-aware questions —
then turn the same resource into flashcards and quizzes.

Built with **React 18 + Vite + Tailwind CSS + React Router**.

## 1. Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend, default http://localhost:5000
npm run dev
```

The app runs at `http://localhost:5173` and expects a running PrepSpace backend
(Express + MongoDB + Gemini) implementing the API contract below.

## 2. Project structure

```
src/
├── pages/            One component per route (Login, Register, Dashboard, Notebook,
│                      Document, Flashcards, Quiz, QuizResults, Profile)
├── components/
│   ├── layout/        Navbar, Sidebar (notebook "spine tabs"), AppLayout, ProtectedRoute
│   ├── common/         Spinner, Modal, EmptyState
│   ├── notebooks/       NotebookCard, CreateNotebookModal
│   ├── documents/       DocumentCard, UploadDocumentModal, PdfViewer
│   ├── ai/              ChatPanel (AI Study Mode)
│   ├── flashcards/      FlashcardDeck (flip-card UI)
│   └── quiz/             QuizPlayer (question-by-question + scoring)
├── services/          One file per API resource — thin wrappers around axios
├── context/           AuthContext — session state, login/register/logout
└── utils/             apiPaths.js (endpoint map), axiosinstance.js (JWT + 401 handling)
```

## 3. Authentication flow

- JWT is stored in `localStorage` under `prepspace_token` (and the cached user under
  `prepspace_user`), matching the token strategy already used by the scaffolded
  `authService.js`.
- Every request through `axiosinstance.js` automatically attaches
  `Authorization: Bearer <token>`.
- A `401` response anywhere clears the session and redirects to `/login`.
- `ProtectedRoute` guards every authenticated page; `RedirectIfAuthed` keeps a logged-in
  user off `/login` and `/register`.

## 4. Expected backend API contract

| Method | Path                              | Purpose                              |
|--------|-----------------------------------|---------------------------------------|
| POST   | `/api/auth/register`              | `{name,email,password}` → `{user,token}` |
| POST   | `/api/auth/login`                 | `{email,password}` → `{user,token}`  |
| GET    | `/api/auth/me`                    | `{user}` for the current token       |
| GET    | `/api/notebooks`                  | List the user's notebooks            |
| POST   | `/api/notebooks`                  | `{name,description,color}`           |
| GET    | `/api/notebooks/:id`               | One notebook                         |
| PUT    | `/api/notebooks/:id`               | Update notebook                      |
| DELETE | `/api/notebooks/:id`               | Delete notebook (+ its documents)    |
| GET    | `/api/documents?notebookId=`       | List documents in a notebook         |
| POST   | `/api/documents`                   | Multipart upload: `file, notebookId, title` |
| GET    | `/api/documents/:id`                | One document, incl. `fileUrl`        |
| PUT    | `/api/documents/:id`                | Update document metadata             |
| DELETE | `/api/documents/:id`                | Delete document                      |
| POST   | `/api/ai/chat`                     | `{documentId,message,conversationId}` → `{reply,conversationId}` |
| POST   | `/api/ai/flashcards`               | `{documentId,count}` → generated cards |
| POST   | `/api/ai/quiz`                     | `{documentId,count,difficulty}` → generated questions |
| GET    | `/api/flashcards?documentId=`       | List saved flashcard sets            |
| POST   | `/api/flashcards`                   | Save a generated set                 |
| GET    | `/api/quizzes?documentId=`          | List saved quizzes                   |
| POST   | `/api/quizzes`                      | Save a generated quiz                |
| POST   | `/api/quizzes/:id/submit`           | `{answers:[{questionId,selectedOption}]}` → `{score,total,breakdown}` |

`fileUrl` returned by `/api/documents` can be either a relative path served by the
Express `uploads/` static folder (resolved against `VITE_API_BASE_URL` in
`PdfViewer.jsx`) or an absolute object-storage URL — both work unchanged.

## 5. Design notes

The visual language leans into the "study desk" identity: a warm paper background,
deep pine-green as the primary accent, and a brass/gold ribbon color reserved for
highlights. Each notebook carries its own color as a **spine tab** — a small colored
bar borrowed from a physical binder divider — used consistently in the sidebar,
notebook cards, and the notebook header, so a subject stays visually identifiable
everywhere it appears.

## 6. Build for production

```bash
npm run build
npm run preview
```

Output is written to `dist/`.
