import {
  useCallback,
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../types";
import api from "../api/axios";
import { isJwtExpired } from "../utils/jwt";

type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

const AUTH_STORAGE_KEY = "estock_auth_session";

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  setAuthSession: (session: AuthSession) => void;
  clearAuthSession: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const applyAccessTokenToApi = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

const readStoredSession = (): AuthSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AuthSession>;

    if (
      typeof parsed.accessToken !== "string" ||
      !parsed.user ||
      isJwtExpired(parsed.accessToken)
    ) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      user: parsed.user as AuthUser,
    };
  } catch {
    return null;
  }
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [storedSession, setStoredSession] = useState<AuthSession | null>(() => {
    const session = readStoredSession();
    applyAccessTokenToApi(session?.accessToken || null);
    return session;
  });
  const accessToken = storedSession?.accessToken || null;
  const user = storedSession?.user || null;

  const setAuthSession = useCallback((session: AuthSession) => {
    setStoredSession(session);
    applyAccessTokenToApi(session.accessToken);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  }, []);

  const clearAuthSession = useCallback(() => {
    setStoredSession(null);
    applyAccessTokenToApi(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        setAuthSession,
        clearAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export { AuthProvider, useAuth };
