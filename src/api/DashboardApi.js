import { httpClient } from "./axiosClient";

const BASE_URL = import.meta.env.VITE_URL || "http://127.0.0.1:8000";

const dashboardApi = {
  getStats() {
    return httpClient.get(`${BASE_URL}/admin/dashboard/stats`);
  },
};

export default dashboardApi;
