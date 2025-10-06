import axios, { AxiosError } from "axios";
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
      "An unexpected error occurred";

    showErrorToast(errorMessage);

    return Promise.reject(error);
  }
);

export { httpClient };
