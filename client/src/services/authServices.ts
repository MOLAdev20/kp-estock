import api from "../api/axios";
import type {
  LoginPayload,
  LoginResponse,
  RefreshSessionResponse,
} from "../types";

let refreshSessionPromise: Promise<RefreshSessionResponse> | null = null;

const authServices = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post("/auth", payload);
    return response.data;
  },

  refreshSession: async (): Promise<RefreshSessionResponse> => {
    if (!refreshSessionPromise) {
      refreshSessionPromise = api
        .post("/auth/refresh")
        .then((response) => response.data)
        .finally(() => {
          refreshSessionPromise = null;
        });
    }

    return refreshSessionPromise;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};

export default authServices;
