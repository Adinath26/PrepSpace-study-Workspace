# PrepSpace — AI-Powered Study Workspace

PrepSpace is a full-stack study platform that helps students organize PDF-based study material into notebooks and use AI to study the content through context-aware Q&A, flashcards, and quizzes.

## Features

* 📚 Organize study resources into subject-based notebooks
* 📄 Upload and view PDF study material
* 🤖 Ask context-aware questions about uploaded documents using Gemini
* 💬 Maintain persistent chat history for document-based conversations
* 📝 Generate AI-powered flashcards from study material
* 🧠 Generate multiple-choice quizzes with difficulty selection
* 🔐 JWT-based authentication and protected APIs
* 👤 User-specific notebooks, documents, chats, flashcards, and quizzes

## Tech Stack

### Frontend

* React 18
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer

### AI & Document Processing

* Google Gemini API
* PDF text extraction using `pdf-parse`
* Text chunking with overlapping chunks
* Keyword-based retrieval for selecting relevant document content
* Structured JSON generation for flashcards and quizzes

## Architecture

```text
                        ┌──────────────────────┐
                        │      React App       │
                        │  React + Tailwind    │
                        └──────────┬───────────┘
                                   │ REST API
                                   ▼
                        ┌──────────────────────┐
                        │   Express Backend    │
                        │   Auth + Controllers │
                        └──────┬───────┬───────┘
                               │       │
                    ┌──────────┘       └──────────────┐
                    ▼                                 ▼
          ┌─────────────────┐               ┌─────────────────┐
          │ MongoDB /       │               │   Gemini API    │
          │ Mongoose        │               │ AI Generation   │
          └─────────────────┘               └─────────────────┘
```

## AI Study Mode

PrepSpace uses a document-based retrieval workflow for AI-assisted study.

```text
PDF Upload
    ↓
PDF Text Extraction
    ↓
Overlapping Text Chunks
    ↓
Stored with Document
    ↓
Student Question
    ↓
Keyword-Based Relevant Chunk Selection
    ↓
Relevant Context + Recent Chat History
    ↓
Gemini API
    ↓
Context-Aware Response
    ↓
Persistent Chat History
```

For each question, relevant chunks are selected from the uploaded document and combined with recent conversation history before being sent to Gemini.

The current implementation uses **keyword-based retrieval** rather than embeddings or a vector database.

## Flashcards & Quizzes

PrepSpace can generate revision material directly from uploaded study documents.

### Flashcards

Gemini generates question-answer pairs from the study material and returns them as structured JSON.

### Quizzes

Gemini generates multiple-choice questions with options, correct answers, explanations, and configurable difficulty. Quiz scoring is handled on the backend.

## Authentication & Security

* Passwords are hashed using bcrypt.
* Authentication is handled using JWTs.
* Private API routes require a valid Bearer token.
* Resources are scoped to the authenticated user.
* PDF uploads are restricted to PDF files and size-limited.
* API errors are handled through centralized Express middleware.
* Gemini API credentials are stored in environment variables.

## Project Structure

```text
PrepSpace/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    ├── .env.example
    └── package.json
```

## Getting Started

### Prerequisites

* Node.js 18+
* MongoDB
* Gemini API key

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd PrepSpace
```

### 2. Start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your MongoDB URI, JWT secret, and Gemini API key.

Then start the server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Set the frontend environment variable to point to your backend:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Future Improvements

Potential improvements include:

* Embedding-based semantic retrieval
* Vector database integration
* OCR support for scanned PDFs
* More advanced document retrieval and ranking
* Streaming AI responses
* Improved AI response evaluation and validation

## Author

**Adinath Kulkarni**

B.Tech Information Technology
Netaji Subhas University of Technology
