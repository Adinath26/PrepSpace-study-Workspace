import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";

export const getDocuments = async (notebookId) => {
  const { data } = await axiosInstance.get(API_PATHS.DOCUMENTS.LIST, {
    params: notebookId ? { notebookId } : {},
  });
  return data.documents ?? data;
};

export const getDocument = async (id) => {
  const { data } = await axiosInstance.get(API_PATHS.DOCUMENTS.GET(id));
  return data.document ?? data;
};

export const uploadDocument = async ({ file, notebookId, title, onUploadProgress }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("notebookId", notebookId);
  formData.append("title", title || file.name);

  const { data } = await axiosInstance.post(API_PATHS.DOCUMENTS.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onUploadProgress && evt.total) {
        onUploadProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return data.document ?? data;
};

export const updateDocument = async (id, payload) => {
  const { data } = await axiosInstance.put(API_PATHS.DOCUMENTS.UPDATE(id), payload);
  return data.document ?? data;
};

export const deleteDocument = async (id) => {
  const { data } = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE(id));
  return data;
};
