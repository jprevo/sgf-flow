import axios, { AxiosError } from "axios";
import i18n from "i18next";
import { showErrorToast } from "./toast.service";

const httpClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle errors globally
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      i18n.t("errors.unexpectedError");

    showErrorToast(errorMessage);

    return Promise.reject(error);
  },
);

export { httpClient };
