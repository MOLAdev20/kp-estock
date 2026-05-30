import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { isJwtExpired } from "../../utils/jwt";
import { shouldSkipAuthRedirectMessage } from "../../utils/authRedirect";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { accessToken, user, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  if (!accessToken || !user || isJwtExpired(accessToken)) {
    if (shouldSkipAuthRedirectMessage()) {
      return <Navigate to="/" replace />;
    }

    return (
      <Navigate
        to="/"
        replace
        state={{ authMessage: "anda harus login dulu" }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
