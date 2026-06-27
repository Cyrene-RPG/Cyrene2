import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  attachUpdaterWindow,
  checkForUpdatesManually,
  getAppInfo,
  installUpdateNow,
} from "./updater";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTOCOL = "cyrene";

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

let mainWindow: BrowserWindow | null = null;
let devReloadAttempts = 0;

function loadDevServerUrl(url = VITE_DEV_SERVER_URL!) {
  if (!mainWindow || !url) return;
  mainWindow.loadURL(url);
}

function loadAuthCallback(url: string) {
  if (!mainWindow) return;

  try {
    const parsed = new URL(url);
    const route = parsed.pathname || "/link-up";
    const suffix = `${parsed.search}${parsed.hash}`;

    if (VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(`${VITE_DEV_SERVER_URL}${route}${suffix}`);
    } else {
      const indexPath = path.join(RENDERER_DIST, "index.html");
      mainWindow.loadFile(indexPath, { hash: `${route}${suffix}` });
    }

    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } catch {
    // Ignore malformed deep links.
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 810,
    minWidth: 1100,
    minHeight: 650,
    show: false,
    title: "Cyrene",
    icon: path.join(process.env.APP_ROOT!, "public", "favicon.png"),
    autoHideMenuBar: true,
    backgroundColor: "#000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  if (VITE_DEV_SERVER_URL) {
    loadDevServerUrl();

    mainWindow.webContents.on("did-fail-load", (_event, errorCode, _description, url) => {
      if (!VITE_DEV_SERVER_URL || !url.startsWith(VITE_DEV_SERVER_URL)) return;
      // ERR_CONNECTION_REFUSED — dev server not ready yet or temporarily down.
      if (errorCode !== -102 || devReloadAttempts >= 12) return;

      devReloadAttempts += 1;
      setTimeout(() => loadDevServerUrl(), 1000);
    });

    mainWindow.webContents.on("did-finish-load", () => {
      devReloadAttempts = 0;
    });
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    if (mainWindow && !VITE_DEV_SERVER_URL) {
      attachUpdaterWindow(mainWindow);
    }
  });

  mainWindow.on("enter-full-screen", () => {
    mainWindow?.webContents.send("cyrene:fullscreen-changed", true);
  });

  mainWindow.on("leave-full-screen", () => {
    mainWindow?.webContents.send("cyrene:fullscreen-changed", false);
  });
}

function registerWindowIpc() {
  ipcMain.handle("cyrene:window-get-state", () => ({
    fullscreen: mainWindow?.isFullScreen() ?? false,
  }));

  ipcMain.handle("cyrene:window-set-fullscreen", (_event, enabled: boolean) => {
    mainWindow?.setFullScreen(enabled);
    return mainWindow?.isFullScreen() ?? false;
  });

  ipcMain.handle("cyrene:window-leave", () => {
    app.quit();
  });

  ipcMain.handle("cyrene:get-app-info", () => getAppInfo());

  ipcMain.handle("cyrene:check-for-updates", () => checkForUpdatesManually());

  ipcMain.handle("cyrene:install-update", () => {
    installUpdateNow();
  });
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const deepLink = argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
    if (deepLink) loadAuthCallback(deepLink);

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  registerWindowIpc();
  createWindow();

  const deepLink = process.argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
  if (deepLink) loadAuthCallback(deepLink);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
