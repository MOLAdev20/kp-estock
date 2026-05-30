const SKIP_AUTH_REDIRECT_MESSAGE_KEY = "estock_skip_auth_redirect_message";

const markSkipAuthRedirectMessage = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SKIP_AUTH_REDIRECT_MESSAGE_KEY, "1");
};

const shouldSkipAuthRedirectMessage = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.sessionStorage.getItem(SKIP_AUTH_REDIRECT_MESSAGE_KEY) === "1"
  );
};

const clearSkipAuthRedirectMessage = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(SKIP_AUTH_REDIRECT_MESSAGE_KEY);
};

export {
  clearSkipAuthRedirectMessage,
  markSkipAuthRedirectMessage,
  shouldSkipAuthRedirectMessage,
};
