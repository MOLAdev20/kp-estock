import api from "../api/axios";
import type { ManagedUser } from "../types";

type UserPayload = {
  username: string;
  email: string;
  role: string;
};

const userManagementServices = {
  getUsers: async (): Promise<ManagedUser[]> => {
    const response = await api.get("/users");
    return response.data.data;
  },

  createUser: async (
    payload: UserPayload & { password: string },
  ): Promise<ManagedUser> => {
    const response = await api.post("/users", payload);
    return response.data.data;
  },

  updateUser: async (id: number, payload: UserPayload): Promise<ManagedUser> => {
    const response = await api.put(`/users/${id}`, payload);
    return response.data.data;
  },

  changePassword: async (id: number, password: string): Promise<void> => {
    await api.patch(`/users/${id}/password`, { password });
  },
};

export default userManagementServices;
