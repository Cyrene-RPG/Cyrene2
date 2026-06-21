import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("cyreneDesktop", {
  platform: process.platform,
  isDesktop: true,
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
