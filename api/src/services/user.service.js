import { SignJWT, jwtVerify } from "jose";
import { prisma } from "../lib/prisma.js";
import env from "../config/env.js";

const encoder = new TextEncoder();

const ACCESS_SECRET = encoder.encode(
  env.AUTH.JWT_ACCESS_SECRET || "dev-access-secret",
);
const REFRESH_SECRET = encoder.encode(
  env.AUTH.JWT_REFRESH_SECRET || "dev-refresh-secret",
);
const ACCESS_EXPIRES_IN = env.AUTH.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = env.AUTH.JWT_REFRESH_EXPIRES_IN || "7d";

const buildServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const signAccessToken = async (user) => {
  return await new SignJWT({
    sub: String(user.id),
    username: user.username,
    role: user.role,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRES_IN)
    .sign(ACCESS_SECRET);
};

const signRefreshToken = async (user) => {
  return await new SignJWT({
    sub: String(user.id),
    username: user.username,
    role: user.role,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES_IN)
    .sign(REFRESH_SECRET);
};

const userService = {
  login: async ({ username, password }) => {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!user || user.password !== password) {
      throw buildServiceError("wrong username or password", 401);
    }

    const accessToken = await signAccessToken(user);
    const refreshToken = await signRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },

  refreshAccessToken: async (refreshToken) => {
    let payload;

    try {
      const verified = await jwtVerify(refreshToken, REFRESH_SECRET, {
        algorithms: ["HS256"],
      });
      payload = verified.payload;
    } catch {
      throw buildServiceError("invalid refresh token", 401);
    }

    if (payload.type !== "refresh" || !payload.sub) {
      throw buildServiceError("invalid refresh token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
    });

    if (!user || !user.refresh_token || user.refresh_token !== refreshToken) {
      throw buildServiceError("invalid refresh token", 401);
    }

    const accessToken = await signAccessToken(user);

    return { accessToken };
  },

  logout: async (refreshToken) => {
    let payload;

    try {
      const verified = await jwtVerify(refreshToken, REFRESH_SECRET, {
        algorithms: ["HS256"],
      });
      payload = verified.payload;
    } catch {
      throw buildServiceError("invalid refresh token", 401);
    }

    if (payload.type !== "refresh" || !payload.sub) {
      throw buildServiceError("invalid refresh token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
    });

    if (!user || !user.refresh_token || user.refresh_token !== refreshToken) {
      throw buildServiceError("invalid refresh token", 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: null },
    });

    return null;
  },
};

export default userService;
