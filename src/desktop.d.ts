export {};

declare global {
  interface Window {
    cyreneDesktop?: {
      platform: string;
      isDesktop: true;
      getWindowState: () => Promise<{ fullscreen: boolean }>;
      setFullscreen: (enabled: boolean) => Promise<boolean>;
      leaveCity: () => Promise<void>;
      onFullscreenChange: (callback: (fullscreen: boolean) => void) => () => void;
    };
  }
}
