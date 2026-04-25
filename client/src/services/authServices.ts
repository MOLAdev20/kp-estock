import api from "../api/axios";
import type { LoginPayload, LoginResponse } from "../types";

const authServices = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post("/auth", payload);
    return response.data;
  },
};

export default authServices;
