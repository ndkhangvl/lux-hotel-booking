import { apiClient } from "./axiosClient";

const AUTH_API_URL = 'api/auth';

const authApi = {
  login({ username, password }) {
    return apiClient.post(
      `${AUTH_API_URL}/login2`,
      null,
      {
        auth: {
          username,
          password,
        },
      }
    );
  },
};

export default authApi;
