import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { isJwtExpired } from "../../utils/jwt";
import { isSuperAdminRole } from "../../utils/role";

const SuperAdminRoute = ({ children }: { children: ReactNode }) => {
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

  if (!isSuperAdminRole(user.role)) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ authMessage: "anda tidak punya akses ke halaman ini" }}
      />
    );
  }

  return children;
};

export default SuperAdminRoute;
