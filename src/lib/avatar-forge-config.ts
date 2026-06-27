export const AVATAR_FORGE_PAUSED = false;

export const PROFILE_PATH = "/profile";

export function getProfileAvatarPath(avatarId: string) {
  return `/profile/avatars/${avatarId}`;
}

export function isAvatarForgePaused() {
  return AVATAR_FORGE_PAUSED;
}

export function getPostLinkUpPath() {
  return isAvatarForgePaused() ? PROFILE_PATH : "/avatar-forge";
}

export function isExternalAppPath(path: string) {
  return path.endsWith(".html");
}

export function goToAppPath(path: string, navigate: (to: string, options?: { replace?: boolean }) => void) {
  if (isExternalAppPath(path)) {
    window.location.href = path;
    return;
  }
  navigate(path, { replace: true });
}
