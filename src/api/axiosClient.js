import { getCookie } from "@/lib/utils";
import { ACCESS_TOKEN } from "@/utils/constant";
import axios from "axios";

const API_URL = import.meta.env.VITE_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_URL,
});

httpClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (error?.response?.status === 401) {
     // unAuthorization(error);
    }

    return Promise.reject(error);
  }
);

httpClient.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem(ACCESS_TOKEN) || getCookie(ACCESS_TOKEN);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    console.log(error);
    return Promise.reject(error);
  }
);

export { apiClient, httpClient };

