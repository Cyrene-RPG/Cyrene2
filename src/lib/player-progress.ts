const HAS_PLAYED_KEY = "cyrene_has_played";
const RESUME_PATH_KEY = "cyrene_resume_path";

const DEFAULT_RESUME_PATH = "/city";

const BLOCKED_RESUME_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/verify-email",
  "/continue",
  "/identity",
  "/resume",
  "/link-up",
  "/profile",
]);

export function markHasPlayed() {
  localStorage.setItem(HAS_PLAYED_KEY, "true");
}

export function hasLocalPlayRecord(): boolean {
  return localStorage.getItem(HAS_PLAYED_KEY) === "true";
}

export function isValidResumePath(pathname: string): boolean {
  if (!pathname.startsWith("/") || pathname.endsWith(".html")) return false;
  if (BLOCKED_RESUME_PATHS.has(pathname)) return false;
  return (
    pathname.startsWith("/city") ||
    pathname.startsWith("/missions") ||
    pathname.startsWith("/magic-shop")
  );
}

export function saveResumePath(path: string) {
  const pathname = path.split("?")[0]?.split("#")[0] ?? path;
  if (!isValidResumePath(pathname)) return;
  localStorage.setItem(RESUME_PATH_KEY, path);
}

export function getResumeGamePath(): string {
  const saved = localStorage.getItem(RESUME_PATH_KEY);
  const pathname = saved?.split("?")[0]?.split("#")[0];
  if (saved && pathname && isValidResumePath(pathname)) {
    return saved;
  }
  return DEFAULT_RESUME_PATH;
}

export function formatResumeLabel(path: string): string {
  const pathname = path.split("?")[0]?.split("#")[0] ?? path;
  if (pathname === "/city") return "CITY GRID";
  if (pathname.startsWith("/city/locations/gate-nine-motel")) return "GATE NINE MOTEL";
  if (pathname.startsWith("/city/locations/")) return "CITY SECTOR";
  if (pathname.startsWith("/missions")) return "MISSION BOARD";
  if (pathname.startsWith("/magic-shop")) return "MAGIC SHOP";
  return "CITY GRID";
}
