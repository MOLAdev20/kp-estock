const normalizeRole = (role) => String(role || "").trim().toLowerCase().replaceAll("_", "-");

const superAdminOnly = (req, res, next) => {
  const role = normalizeRole(req.user?.role);

  if (role !== "super-admin") {
    return res.status(403).json({
      success: false,
      message: "forbidden",
    });
  }

  return next();
};

export default superAdminOnly;
