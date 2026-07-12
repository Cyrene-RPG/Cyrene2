export {};

declare global {
  interface Window {
    cyreneDesktop?: {
      platform: string;
      isDesktop: true;
      updateChannel: "latest" | "beta";
      getAppInfo: () => Promise<{
        version: string;
        channel: string;
        updatesEnabled: boolean;
      }>;
      checkForUpdates: () => Promise<{
        version: string;
        channel: string;
        updatesEnabled: boolean;
      }>;
      installUpdate: () => Promise<void>;
      onUpdateStatus: (
        callback: (status: {
          state:
            | "idle"
            | "checking"
            | "available"
            | "not-available"
            | "downloading"
            | "ready"
            | "error";
          version?: string;
          percent?: number;
          message?: string;
        }) => void,
      ) => () => void;
      getWindowState: () => Promise<{ fullscreen: boolean }>;
      setFullscreen: (enabled: boolean) => Promise<boolean>;
      leaveCity: () => Promise<void>;
      onFullscreenChange: (callback: (fullscreen: boolean) => void) => () => void;
    };
  }
}
