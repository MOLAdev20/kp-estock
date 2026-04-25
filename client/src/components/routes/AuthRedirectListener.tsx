import { isAxiosError } from "axios";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

const AuthRedirectListener = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuthSession } = useAuth();

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!isAxiosError(error)) {
          return Promise.reject(error);
        }

        const status = error.response?.status;
        const requestUrl = error.config?.url || "";
        const isAuthEndpoint = requestUrl.includes("/auth");

        if (status === 401 && !isAuthEndpoint && location.pathname !== "/") {
          clearAuthSession();
          navigate("/", {
            replace: true,
            state: { authMessage: "anda harus login dulu" },
          });
        }

        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [clearAuthSession, location.pathname, navigate]);

  return null;
};

export default AuthRedirectListener;
