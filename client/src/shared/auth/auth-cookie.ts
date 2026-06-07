const AUTH_COOKIE_NAME = "auth-token";
const AUTH_COOKIE_MAX_AGE = 3600;

export function setAuthCookie(token: string): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookie(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
