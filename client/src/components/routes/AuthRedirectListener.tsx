import { isAxiosError } from "axios";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { shouldSkipAuthRedirectMessage } from "../../utils/authRedirect";

const AuthRedirectListener = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuthSession, refreshSession, user } = useAuth();

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (!isAxiosError(error)) {
          return Promise.reject(error);
        }

        const status = error.response?.status;
        const requestUrl = error.config?.url || "";
        const originalRequest = error.config as typeof error.config & {
          _retry?: boolean;
        };
        const isRefreshEndpoint = requestUrl.includes("/auth/refresh");
        const isLoginEndpoint = requestUrl === "/auth" || requestUrl.endsWith("/auth");
        const isLogoutEndpoint = requestUrl.includes("/auth/logout");
        const isAuthEndpoint =
          isRefreshEndpoint || isLoginEndpoint || isLogoutEndpoint;

        if (status === 401 && !isAuthEndpoint && originalRequest && !originalRequest._retry && user) {
          originalRequest._retry = true;

          const refreshed = await refreshSession();

          if (refreshed) {
            return api(originalRequest);
          }
        }

        if (status === 401 && !isRefreshEndpoint && location.pathname !== "/") {
          clearAuthSession();

          if (!shouldSkipAuthRedirectMessage()) {
            navigate("/", {
              replace: true,
              state: { authMessage: "anda harus login dulu" },
            });
            return Promise.reject(error);
          }

          navigate("/", { replace: true });
        }

        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [clearAuthSession, location.pathname, navigate, refreshSession, user]);

  return null;
};

export default AuthRedirectListener;
