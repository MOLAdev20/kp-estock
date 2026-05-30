const REFRESH_TOKEN_COOKIE_NAME = "estock_refresh_token";

const parseCookieHeader = (cookieHeader) => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce((cookies, entry) => {
    const [rawName, ...rawValueParts] = entry.split("=");
    const name = rawName?.trim();

    if (!name) {
      return cookies;
    }

    cookies[name] = decodeURIComponent(rawValueParts.join("=").trim());
    return cookies;
  }, {});
};

const getRefreshTokenFromRequest = (req) => {
  const cookies = parseCookieHeader(req.headers.cookie);
  const refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME];

  return typeof refreshToken === "string" ? refreshToken : null;
};

const parseDurationToMs = (value) => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d+)(ms|s|m|h|d)$/i);

  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const unitMap = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitMap[unit];
};

const buildRefreshTokenCookieOptions = (expiresIn) => {
  const secure = process.env.AUTH_COOKIE_SECURE === "true"
    ? true
    : process.env.AUTH_COOKIE_SECURE === "false"
      ? false
      : process.env.NODE_ENV === "production";

  const sameSite = secure ? "none" : "lax";
  const maxAge = parseDurationToMs(expiresIn);

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/auth",
    ...(maxAge ? { maxAge } : {}),
  };
};

const setRefreshTokenCookie = (res, refreshToken, expiresIn) => {
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    buildRefreshTokenCookieOptions(expiresIn),
  );
};

const clearRefreshTokenCookie = (res, expiresIn) => {
  res.clearCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    buildRefreshTokenCookieOptions(expiresIn),
  );
};

export {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  setRefreshTokenCookie,
};
