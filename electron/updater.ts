import { createRequire } from "node:module";
import { app, type BrowserWindow } from "electron";
import type { UpdateInfo } from "electron-updater";

const require = createRequire(import.meta.url);
const { autoUpdater } = require("electron-updater") as {
  autoUpdater: {
    logger: unknown;
    autoDownload: boolean;
    autoInstallOnAppQuit: boolean;
    allowDowngrade: boolean;
    channel: string;
    on(event: string, listener: (...args: never[]) => void): void;
    checkForUpdates(): Promise<unknown>;
    quitAndInstall(isSilent?: boolean, isForceRunAfter?: boolean): void;
  };
};
const log = require("electron-log");

export type UpdateStatusPayload =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available"; version: string }
  | { state: "not-available"; version: string }
  | { state: "downloading"; percent: number }
  | { state: "ready"; version: string }
  | { state: "error"; message: string };

export function getAppInfo() {
  return {
    version: app.getVersion(),
    channel: __UPDATE_CHANNEL__,
    updatesEnabled: app.isPackaged,
  };
}

export function initAutoUpdater(mainWindow: BrowserWindow) {
  if (!app.isPackaged) return;

  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;

  if (__UPDATE_CHANNEL__ !== "latest") {
    autoUpdater.channel = __UPDATE_CHANNEL__;
  }

  const send = (payload: UpdateStatusPayload) => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send("cyrene:update-status", payload);
  };

  autoUpdater.on("checking-for-update", () => {
    send({ state: "checking" });
  });

  autoUpdater.on("update-available", (info: UpdateInfo) => {
    send({ state: "available", version: info.version });
  });

  autoUpdater.on("update-not-available", (info: UpdateInfo) => {
    send({ state: "not-available", version: info.version });
  });

  autoUpdater.on("download-progress", (progress: { percent: number }) => {
    send({ state: "downloading", percent: progress.percent });
  });

  autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
    send({ state: "ready", version: info.version });
  });

  autoUpdater.on("error", (error: Error) => {
    send({
      state: "error",
      message: error.message || "Update check failed.",
    });
  });

  setTimeout(() => {
    void autoUpdater.checkForUpdates().catch((error: Error) => {
      send({
        state: "error",
        message: error.message || "Update check failed.",
      });
    });
  }, 10_000);
}

export async function checkForUpdatesManually() {
  if (!app.isPackaged) {
    return getAppInfo();
  }

  await autoUpdater.checkForUpdates();
  return getAppInfo();
}

export function installUpdateNow() {
  if (!app.isPackaged) return;
  autoUpdater.quitAndInstall(false, true);
}

export function attachUpdaterWindow(mainWindow: BrowserWindow) {
  initAutoUpdater(mainWindow);
}
