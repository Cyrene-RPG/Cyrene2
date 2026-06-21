import { clearPendingLinkUp, setPendingLinkUp } from "./app-url";
import { clearAvatarDraft } from "./avatar-draft";
import { PROFILE_PATH } from "./avatar-forge-config";

const DEV_LAND_FORGE_KEY = "cyrene_dev_land_forge";

export function isDevMode() {
  return import.meta.env.DEV;
}

/** Dev forge skip is off by default; use → FORGE or enableDevLandForge() to skip link-up. */
export function isDevLandForgeEnabled() {
  if (!isDevMode()) return false;
  return sessionStorage.getItem(DEV_LAND_FORGE_KEY) === "on";
}

export function enableDevLandForge() {
  if (!isDevMode()) return;
  sessionStorage.setItem(DEV_LAND_FORGE_KEY, "on");
  clearPendingLinkUp();
}

export function disableDevLandForge() {
  if (!isDevMode()) return;
  sessionStorage.setItem(DEV_LAND_FORGE_KEY, "off");
}

export function prepareDevForgeSkip() {
  enableDevLandForge();
  clearPendingLinkUp();
}

/** Dev profile jump — clears onboarding flags so profile is not redirected away. */
export function openDevProfile(
  navigate: (path: string, options?: { replace?: boolean }) => void,
) {
  if (!isDevMode()) return;
  disableDevLandForge();
  clearPendingLinkUp();
  navigate(PROFILE_PATH, { replace: true });
}

/** Replay post-signup flow: neural link-up, then avatar forge on continue. */
export function replayPostSignupOnboarding(
  navigate: (path: string, options?: { replace?: boolean }) => void,
  username = "operator",
) {
  if (!isDevMode()) return;
  disableDevLandForge();
  clearAvatarDraft();
  setPendingLinkUp(username);
  navigate("/link-up", { replace: true });
}
