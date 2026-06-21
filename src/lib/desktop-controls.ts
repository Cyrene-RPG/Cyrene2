const FULLSCREEN_STORAGE_KEY = "cyrene:fullscreen";

export function isFullscreenSaved(): boolean {
  return localStorage.getItem(FULLSCREEN_STORAGE_KEY) === "true";
}

export async function getFullscreen(): Promise<boolean> {
  if (window.cyreneDesktop?.getWindowState) {
    const state = await window.cyreneDesktop.getWindowState();
    return state.fullscreen;
  }

  return Boolean(document.fullscreenElement);
}

export async function setFullscreen(enabled: boolean): Promise<boolean> {
  localStorage.setItem(FULLSCREEN_STORAGE_KEY, String(enabled));

  if (window.cyreneDesktop?.setFullscreen) {
    return window.cyreneDesktop.setFullscreen(enabled);
  }

  try {
    if (enabled) {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch {
    // Browser may block fullscreen outside a user gesture.
  }

  return Boolean(document.fullscreenElement);
}

export async function applySavedFullscreen(): Promise<void> {
  if (!isFullscreenSaved()) return;
  await setFullscreen(true);
}

export function leaveCity(): void {
  if (window.cyreneDesktop?.leaveCity) {
    void window.cyreneDesktop.leaveCity();
    return;
  }

  window.close();
}

export function subscribeFullscreenChange(
  callback: (fullscreen: boolean) => void,
): () => void {
  if (window.cyreneDesktop?.onFullscreenChange) {
    return window.cyreneDesktop.onFullscreenChange(callback);
  }

  function onChange() {
    callback(Boolean(document.fullscreenElement));
  }

  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}
