import { prisma } from "../lib/prisma.js";

const MIN_PASSWORD_LENGTH = 6;
const STAFF_ROLE = "STAFF";

const buildServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeRole = (role) => String(role || "").trim().toLowerCase().replaceAll("-", "_");

const normalizeUserPayload = ({ username, email }) => ({
  username: String(username || "").trim(),
  email: String(email || "").trim().toLowerCase(),
});

const normalizeStaffRole = (role) => {
  const normalized = normalizeRole(role || STAFF_ROLE);

  if (normalized !== "staff") {
    throw buildServiceError("only staff role is allowed", 400);
  }

  return STAFF_ROLE;
};

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const parseUserId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw buildServiceError("invalid user id", 400);
  }

  return id;
};

const validatePassword = (password) => {
  const normalized = String(password || "");

  if (normalized.length < MIN_PASSWORD_LENGTH) {
    throw buildServiceError(
      `password minimum length is ${MIN_PASSWORD_LENGTH} characters`,
      400,
    );
  }

  return normalized;
};

const usersService = {
  getAllStaff: async () => {
    const users = await prisma.user.findMany({
      where: {
        role: STAFF_ROLE,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return users.map(sanitizeUser);
  },

  createStaff: async ({ username, email, password, role }) => {
    const payload = normalizeUserPayload({ username, email });
    const passwordValue = validatePassword(password);
    const roleValue = normalizeStaffRole(role);

    if (!payload.username) {
      throw buildServiceError("username is required", 400);
    }

    if (!payload.email) {
      throw buildServiceError("email is required", 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: payload.username }, { email: payload.email }],
      },
    });

    if (existingUser) {
      throw buildServiceError("username or email already exists", 409);
    }

    const created = await prisma.user.create({
      data: {
        username: payload.username,
        email: payload.email,
        password: passwordValue,
        role: roleValue,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return sanitizeUser(created);
  },

  updateStaff: async (id, { username, email, role }) => {
    const userId = parseUserId(id);
    const payload = normalizeUserPayload({ username, email });
    const roleValue = normalizeStaffRole(role);

    if (!payload.username) {
      throw buildServiceError("username is required", 400);
    }

    if (!payload.email) {
      throw buildServiceError("email is required", 400);
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!existing) {
      throw buildServiceError("user not found", 404);
    }

    if (existing.role !== STAFF_ROLE) {
      throw buildServiceError("only staff can be managed from this page", 400);
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        id: {
          not: userId,
        },
        OR: [{ username: payload.username }, { email: payload.email }],
      },
    });

    if (duplicate) {
      throw buildServiceError("username or email already exists", 409);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        username: payload.username,
        email: payload.email,
        role: roleValue,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return sanitizeUser(updated);
  },

  changeStaffPassword: async (id, newPassword) => {
    const userId = parseUserId(id);
    const passwordValue = validatePassword(newPassword);

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!existing) {
      throw buildServiceError("user not found", 404);
    }

    if (existing.role !== STAFF_ROLE) {
      throw buildServiceError("only staff can be managed from this page", 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: passwordValue,
      },
    });

    return null;
  },
};

export default usersService;
