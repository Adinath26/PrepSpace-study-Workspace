// Base URL for the PrepSpace backend. Configure via .env (VITE_API_BASE_URL).
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
  },
  NOTEBOOKS: {
    LIST: "/api/notebooks",
    CREATE: "/api/notebooks",
    GET: (id) => `/api/notebooks/${id}`,
    UPDATE: (id) => `/api/notebooks/${id}`,
    DELETE: (id) => `/api/notebooks/${id}`,
  },
  DOCUMENTS: {
    LIST: "/api/documents", // supports ?notebookId=
    CREATE: "/api/documents", // multipart upload
    GET: (id) => `/api/documents/${id}`,
    UPDATE: (id) => `/api/documents/${id}`,
    DELETE: (id) => `/api/documents/${id}`,
  },
  AI: {
    CHAT: "/api/ai/chat",
    FLASHCARDS: "/api/ai/flashcards",
    QUIZ: "/api/ai/quiz",
  },
  FLASHCARDS: {
    LIST: "/api/flashcards", // supports ?documentId=
    GET: (id) => `/api/flashcards/${id}`,
    CREATE: "/api/flashcards",
    UPDATE: (id) => `/api/flashcards/${id}`,
    DELETE: (id) => `/api/flashcards/${id}`,
  },
  QUIZZES: {
    LIST: "/api/quizzes", // supports ?documentId=
    GET: (id) => `/api/quizzes/${id}`,
    CREATE: "/api/quizzes",
    SUBMIT: (id) => `/api/quizzes/${id}/submit`,
    RESULTS: (id) => `/api/quizzes/${id}/results`,
  },
};
