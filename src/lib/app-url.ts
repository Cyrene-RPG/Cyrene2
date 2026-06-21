export const PENDING_LINKUP_KEY = "cyrene_pending_linkup";

export function getAuthRedirectUrl(path = "/link-up"): string {
  if (typeof window !== "undefined" && window.cyreneDesktop?.isDesktop) {
    return `cyrene://link-up`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return `http://localhost:5173${path}`;
}

export function setPendingLinkUp(username: string) {
  localStorage.setItem(PENDING_LINKUP_KEY, username);
}

export function clearPendingLinkUp() {
  localStorage.removeItem(PENDING_LINKUP_KEY);
}

export function hasPendingLinkUp() {
  return Boolean(localStorage.getItem(PENDING_LINKUP_KEY));
}
