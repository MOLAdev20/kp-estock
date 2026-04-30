const normalizeRole = (role: string | null | undefined) =>
  String(role || "").trim().toLowerCase().replaceAll("_", "-");

export const isSuperAdminRole = (role: string | null | undefined) =>
  normalizeRole(role) === "super-admin";
