import { contextBridge, ipcRenderer } from "electron";

export type DesktopUpdateStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available"; version: string }
  | { state: "not-available"; version: string }
  | { state: "downloading"; percent: number }
  | { state: "ready"; version: string }
  | { state: "error"; message: string };

contextBridge.exposeInMainWorld("cyreneDesktop", {
  platform: process.platform,
  isDesktop: true,
  getAppInfo: () =>
    ipcRenderer.invoke("cyrene:get-app-info") as Promise<{
      version: string;
      channel: string;
      updatesEnabled: boolean;
    }>,
  checkForUpdates: () =>
    ipcRenderer.invoke("cyrene:check-for-updates") as Promise<{
      version: string;
      channel: string;
      updatesEnabled: boolean;
    }>,
  installUpdate: () =>
    ipcRenderer.invoke("cyrene:install-update") as Promise<void>,
  onUpdateStatus: (callback: (status: DesktopUpdateStatus) => void) => {
    const handler = (_event: unknown, status: DesktopUpdateStatus) => {
      callback(status);
    };

    ipcRenderer.on("cyrene:update-status", handler);
    return () => {
      ipcRenderer.removeListener("cyrene:update-status", handler);
    };
  },
  getWindowState: () =>
    ipcRenderer.invoke("cyrene:window-get-state") as Promise<{
      fullscreen: boolean;
    }>,
  setFullscreen: (enabled: boolean) =>
    ipcRenderer.invoke("cyrene:window-set-fullscreen", enabled) as Promise<boolean>,
  leaveCity: () => ipcRenderer.invoke("cyrene:window-leave") as Promise<void>,
  onFullscreenChange: (callback: (fullscreen: boolean) => void) => {
    const handler = (_event: unknown, fullscreen: boolean) => {
      callback(fullscreen);
    };

    ipcRenderer.on("cyrene:fullscreen-changed", handler);
    return () => {
      ipcRenderer.removeListener("cyrene:fullscreen-changed", handler);
    };
  },
});
