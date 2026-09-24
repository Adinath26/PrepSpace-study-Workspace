import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";

export const getQuizzes = async (documentId) => {
  const { data } = await axiosInstance.get(API_PATHS.QUIZZES.LIST, {
    params: documentId ? { documentId } : {},
  });
  return data.quizzes ?? data;
};

export const getQuiz = async (id) => {
  const { data } = await axiosInstance.get(API_PATHS.QUIZZES.GET(id));
  return data.quiz ?? data;
};

export const saveQuiz = async ({ documentId, title, questions }) => {
  const { data } = await axiosInstance.post(API_PATHS.QUIZZES.CREATE, {
    documentId,
    title,
    questions,
  });
  return data.quiz ?? data;
};

export const submitQuiz = async (id, answers) => {
  const { data } = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT(id), {
    answers, // [{ questionId, selectedOption }]
  });
  return data.result ?? data; // { score, total, breakdown }
};

export const getQuizResults = async (id) => {
  const { data } = await axiosInstance.get(API_PATHS.QUIZZES.RESULTS(id));
  return data.result ?? data;
};
