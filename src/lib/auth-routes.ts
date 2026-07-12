import type { NavigateFunction } from "react-router-dom";
import { isBetaDesktopClient } from "./desktop-client";

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const CONTINUE_PATH = "/continue";
export const IDENTITY_PATH = "/identity";

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
  if (isBetaDesktopClient()) {
    return CONTINUE_PATH;
  }
  return "/profile";
}
