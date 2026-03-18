import { httpClient } from "./axiosClient";

const UserApi = {
  async createUser(body) {
    const url = "/api/users";
    return await httpClient.post(url, body);
  },

  async getAllUsers() {
    const url = "/api/users";
    return await httpClient.get(url);
  },

  async getUserById(userId) {
    const url = `/api/users/${userId}`;
    return await httpClient.get(url);
  },
};

export default UserApi;