export type DesktopUpdateStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available"; version: string }
  | { state: "not-available"; version: string }
  | { state: "downloading"; percent: number }
  | { state: "ready"; version: string }
  | { state: "error"; message: string };

export type DesktopAppInfo = {
  version: string;
  channel: string;
  updatesEnabled: boolean;
};
