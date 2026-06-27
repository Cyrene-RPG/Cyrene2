import type { DesktopAppInfo, DesktopUpdateStatus } from "./desktop-updates.types";

export type { DesktopAppInfo, DesktopUpdateStatus } from "./desktop-updates.types";

export async function getDesktopAppInfo(): Promise<DesktopAppInfo | null> {
  if (!window.cyreneDesktop) return null;
  return window.cyreneDesktop.getAppInfo();
}

export async function checkDesktopUpdates(): Promise<DesktopAppInfo | null> {
  if (!window.cyreneDesktop) return null;
  return window.cyreneDesktop.checkForUpdates();
}

export function installDesktopUpdate() {
  return window.cyreneDesktop?.installUpdate();
}

export function subscribeDesktopUpdates(
  callback: (status: DesktopUpdateStatus) => void,
) {
  if (!window.cyreneDesktop) return () => {};
  return window.cyreneDesktop.onUpdateStatus((status) => {
    callback(status as DesktopUpdateStatus);
  });
}

export function formatUpdateStatus(status: DesktopUpdateStatus): string {
  switch (status.state) {
    case "idle":
      return "Standing by.";
    case "checking":
      return "Scanning release channel...";
    case "available":
      return `Update ${status.version} found. Downloading...`;
    case "not-available":
      return "You are on the latest build.";
    case "downloading":
      return `Downloading update... ${Math.round(status.percent)}%`;
    case "ready":
      return `Update ${status.version} ready. Restart to install.`;
    case "error":
      return status.message;
    default:
      return "Standing by.";
  }
}
