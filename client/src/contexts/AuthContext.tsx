import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../types";
import api from "../api/axios";
import { isJwtExpired } from "../utils/jwt";
import authServices from "../services/authServices";

type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

const AUTH_STORAGE_KEY = "estock_auth_session";

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  isInitializing: boolean;
  setAuthSession: (session: AuthSession) => void;
  clearAuthSession: () => void;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
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

    if (typeof parsed.accessToken !== "string" || !parsed.user) {
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
    applyAccessTokenToApi(
      session?.accessToken && !isJwtExpired(session.accessToken)
        ? session.accessToken
        : null,
    );
    return session;
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const storedSessionRef = useRef(storedSession);
  const accessToken = storedSession?.accessToken || null;
  const user = storedSession?.user || null;

  useEffect(() => {
    storedSessionRef.current = storedSession;
  }, [storedSession]);

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

  const refreshSession = useCallback(async () => {
    const currentSession = storedSessionRef.current;

    if (!currentSession?.user) {
      clearAuthSession();
      return false;
    }

    try {
      const response = await authServices.refreshSession();
      const nextSession = {
        accessToken: response.data.accessToken,
        user: response.data.user || currentSession.user,
      };

      setAuthSession(nextSession);
      return true;
    } catch {
      clearAuthSession();
      return false;
    }
  }, [clearAuthSession, setAuthSession]);

  const logout = useCallback(async () => {
    try {
      await authServices.logout();
    } finally {
      clearAuthSession();
    }
  }, [clearAuthSession]);

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      const currentSession = storedSessionRef.current;

      if (!currentSession?.user) {
        if (!cancelled) {
          setIsInitializing(false);
        }
        return;
      }

      if (
        !currentSession.accessToken ||
        isJwtExpired(currentSession.accessToken)
      ) {
        await refreshSession();
      } else {
        applyAccessTokenToApi(currentSession.accessToken);
      }

      if (!cancelled) {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isInitializing,
        setAuthSession,
        clearAuthSession,
        refreshSession,
        logout,
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
