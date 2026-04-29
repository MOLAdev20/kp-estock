import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { isJwtExpired } from "../../utils/jwt";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { accessToken, user } = useAuth();

  if (!accessToken || !user || isJwtExpired(accessToken)) {
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
