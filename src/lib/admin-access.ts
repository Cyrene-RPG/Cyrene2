import type { User } from "@supabase/supabase-js";

function parseAdminList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

const ADMIN_IDENTIFIERS = parseAdminList(import.meta.env.VITE_ADMIN_USERNAMES);

/** Handles with admin access when profiles.is_admin is not set yet. */
export const BUILTIN_ADMIN_HANDLES = new Set(["fallen_star"]);

export function getOperatorHandle(user: User | null | undefined): string {
  if (!user) return "";
  return (
    user.user_metadata?.username ??
    user.email?.split("@")[0] ??
    ""
  )
    .trim()
    .toLowerCase();
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;

  if (user.app_metadata?.role === "admin") return true;
  if (user.user_metadata?.role === "admin") return true;

  const handle = getOperatorHandle(user);
  const email = (user.email ?? "").trim().toLowerCase();

  if (BUILTIN_ADMIN_HANDLES.has(handle)) return true;

  if (ADMIN_IDENTIFIERS.length > 0) {
    return ADMIN_IDENTIFIERS.some(
      (id) => id === handle || id === email || email.startsWith(`${id}@`),
    );
  }

  return false;
}

export function getCityLocationBuildPath(locationId: string): string {
  return `/city/locations/${locationId}`;
}
