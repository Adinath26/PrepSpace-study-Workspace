import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";

export const getFlashcardSets = async (documentId) => {
  const { data } = await axiosInstance.get(API_PATHS.FLASHCARDS.LIST, {
    params: documentId ? { documentId } : {},
  });
  return data.flashcardSets ?? data;
};

export const getFlashcardSet = async (id) => {
  const { data } = await axiosInstance.get(API_PATHS.FLASHCARDS.GET(id));
  return data.flashcardSet ?? data;
};

export const saveFlashcardSet = async ({ documentId, title, cards }) => {
  const { data } = await axiosInstance.post(API_PATHS.FLASHCARDS.CREATE, {
    documentId,
    title,
    cards,
  });
  return data.flashcardSet ?? data;
};

export const updateFlashcardSet = async (id, payload) => {
  const { data } = await axiosInstance.put(API_PATHS.FLASHCARDS.UPDATE(id), payload);
  return data.flashcardSet ?? data;
};

export const deleteFlashcardSet = async (id) => {
  const { data } = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE(id));
  return data;
};
