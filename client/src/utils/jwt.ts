const getJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const base64 = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");

    const payloadJson = window.atob(base64);
    return JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const isJwtExpired = (token: string): boolean => {
  const payload = getJwtPayload(token);

  if (!payload) {
    return true;
  }

  const exp = payload.exp;

  if (typeof exp !== "number") {
    return true;
  }

  return Date.now() >= exp * 1000;
};
