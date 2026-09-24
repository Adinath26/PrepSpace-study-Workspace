import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";

// Sends a question plus the document context; the backend appends conversation
// history server-side so the assistant stays coherent across turns.
export const sendChatMessage = async ({ documentId, message, conversationId }) => {
  const { data } = await axiosInstance.post(API_PATHS.AI.CHAT, {
    documentId,
    message,
    conversationId,
  });
  return data; // { reply, conversationId }
};

export const generateFlashcards = async ({ documentId, count = 10 }) => {
  const { data } = await axiosInstance.post(API_PATHS.AI.FLASHCARDS, {
    documentId,
    count,
  });
  return data.flashcards ?? data;
};

export const generateQuiz = async ({ documentId, count = 10, difficulty = "medium" }) => {
  const { data } = await axiosInstance.post(API_PATHS.AI.QUIZ, {
    documentId,
    count,
    difficulty,
  });
  return data.quiz ?? data;
};
