import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";

export const registerUser = async ({ name, email, password }) => {
  const { data } = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
    name,
    email,
    password,
  });
  return data; // { user, token }
};

export const loginUser = async ({ email, password }) => {
  const { data } = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
    email,
    password,
  });
  return data; // { user, token }
};

export const fetchCurrentUser = async () => {
  const { data } = await axiosInstance.get(API_PATHS.AUTH.ME);
  return data; // { user }
};
