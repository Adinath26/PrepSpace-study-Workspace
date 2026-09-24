import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";

export const getNotebooks = async () => {
  const { data } = await axiosInstance.get(API_PATHS.NOTEBOOKS.LIST);
  return data.notebooks ?? data;
};

export const getNotebook = async (id) => {
  const { data } = await axiosInstance.get(API_PATHS.NOTEBOOKS.GET(id));
  return data.notebook ?? data;
};

export const createNotebook = async ({ name, description, color }) => {
  const { data } = await axiosInstance.post(API_PATHS.NOTEBOOKS.CREATE, {
    name,
    description,
    color,
  });
  return data.notebook ?? data;
};

export const updateNotebook = async (id, payload) => {
  const { data } = await axiosInstance.put(API_PATHS.NOTEBOOKS.UPDATE(id), payload);
  return data.notebook ?? data;
};

export const deleteNotebook = async (id) => {
  const { data } = await axiosInstance.delete(API_PATHS.NOTEBOOKS.DELETE(id));
  return data;
};
