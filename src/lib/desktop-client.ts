declare const __CYRENE_UPDATE_CHANNEL__: "latest" | "beta";

export function readDesktopUpdateChannel(): "latest" | "beta" {
  const fromBridge = window.cyreneDesktop?.updateChannel;
  if (fromBridge === "beta" || fromBridge === "latest") {
    return fromBridge;
  }

  if (typeof __CYRENE_UPDATE_CHANNEL__ !== "undefined") {
    return __CYRENE_UPDATE_CHANNEL__;
  }

  return "latest";
}

/** Test-branch desktop UX (beta channel builds + local Electron dev). */
export function isBetaDesktopClient(): boolean {
  if (window.cyreneDesktop?.isDesktop !== true) {
    return false;
  }

  if (readDesktopUpdateChannel() === "beta") {
    return true;
  }

  // Local Electron dev uses the test-branch menu until stable desktop ships.
  if (import.meta.env.DEV) {
    return true;
  }

  return false;
}
