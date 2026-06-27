import type { NavigateFunction } from "react-router-dom";

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";

export type LoginLocationState = {
  from?: string;
};

export function redirectToLogin(
  navigate: NavigateFunction,
  from?: string,
) {
  navigate(LOGIN_PATH, {
    replace: true,
    state: from ? ({ from } satisfies LoginLocationState) : undefined,
  });
}

export function getPostLoginPath(state: unknown): string {
  const from = (state as LoginLocationState | null)?.from;
  if (from && from.startsWith("/") && !from.endsWith(".html")) {
    return from;
  }
  return "/profile";
}
