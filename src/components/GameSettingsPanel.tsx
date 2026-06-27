import { useEffect, useState } from "react";
import {
  checkDesktopUpdates,
  formatUpdateStatus,
  getDesktopAppInfo,
  installDesktopUpdate,
  subscribeDesktopUpdates,
  type DesktopAppInfo,
  type DesktopUpdateStatus,
} from "../lib/desktop-updates";
import {
  getFullscreen,
  setFullscreen,
  subscribeFullscreenChange,
} from "../lib/desktop-controls";
import "./GameSettingsPanel.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function GameSettingsPanel({ open, onClose }: Props) {
  const [fullscreen, setFullscreenOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [appInfo, setAppInfo] = useState<DesktopAppInfo | null>(null);
  const [updateStatus, setUpdateStatus] = useState<DesktopUpdateStatus>({
    state: "idle",
  });
  const [updateBusy, setUpdateBusy] = useState(false);
  const isDesktop = Boolean(window.cyreneDesktop?.isDesktop);

  useEffect(() => {
    if (!open || !isDesktop) return;

    void getDesktopAppInfo().then(setAppInfo);
    return subscribeDesktopUpdates(setUpdateStatus);
  }, [open, isDesktop]);

  useEffect(() => {
    if (!open) return;

    void getFullscreen().then(setFullscreenOn);
    return subscribeFullscreenChange(setFullscreenOn);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleToggleFullscreen() {
    if (busy) return;

    setBusy(true);
    try {
      const next = await setFullscreen(!fullscreen);
      setFullscreenOn(next);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckUpdates() {
    if (updateBusy || !appInfo?.updatesEnabled) return;

    setUpdateBusy(true);
    try {
      const info = await checkDesktopUpdates();
      if (info) setAppInfo(info);
    } finally {
      setUpdateBusy(false);
    }
  }

  const updateReady = updateStatus.state === "ready";
  const updateLabel = formatUpdateStatus(updateStatus);

  if (!open) return null;

  return (
    <div className="gameSettingsOverlay" role="presentation" onClick={onClose}>
      <section
        className="gameSettingsPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameSettingsTitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gameSettingsPanel__header">
          <span className="gameSettingsPanel__dot" />
          <div>
            <p className="gameSettingsPanel__eyebrow">CLIENT CONFIG</p>
            <h2 id="gameSettingsTitle" className="gameSettingsPanel__title">
              SYSTEM SETTINGS
            </h2>
          </div>
        </div>

        <div className="gameSettingsPanel__body">
          <div className="gameSettingsRow">
            <div className="gameSettingsRow__copy">
              <span className="gameSettingsRow__label">IMMERSIVE DISPLAY</span>
              <span className="gameSettingsRow__hint">
                {isDesktop
                  ? "Fullscreen mode hides the window frame and fills your screen."
                  : "Browser fullscreen hides tabs and the address bar where supported."}
              </span>
            </div>
            <button
              type="button"
              className={`gameSettingsToggle${fullscreen ? " gameSettingsToggle--on" : ""}`}
              role="switch"
              aria-checked={fullscreen}
              disabled={busy}
              onClick={() => void handleToggleFullscreen()}
            >
              <span className="gameSettingsToggle__track">
                <span className="gameSettingsToggle__thumb" />
              </span>
              <span className="gameSettingsToggle__text">
                {fullscreen ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          {isDesktop && appInfo?.updatesEnabled ? (
            <div className="gameSettingsRow gameSettingsRow--stacked">
              <div className="gameSettingsRow__copy">
                <span className="gameSettingsRow__label">CLIENT UPDATES</span>
                <span className="gameSettingsRow__hint">
                  Version {appInfo.version} · channel {appInfo.channel}
                </span>
                <span className="gameSettingsUpdateStatus">{updateLabel}</span>
              </div>
              <div className="gameSettingsUpdateActions">
                {updateReady ? (
                  <button
                    type="button"
                    className="gameSettingsUpdateBtn gameSettingsUpdateBtn--primary"
                    onClick={() => void installDesktopUpdate()}
                  >
                    RESTART &amp; UPDATE
                  </button>
                ) : (
                  <button
                    type="button"
                    className="gameSettingsUpdateBtn"
                    disabled={updateBusy || updateStatus.state === "checking"}
                    onClick={() => void handleCheckUpdates()}
                  >
                    {updateBusy || updateStatus.state === "checking"
                      ? "CHECKING..."
                      : "CHECK FOR UPDATES"}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="gameSettingsPanel__footer">
          <button type="button" className="gameSettingsClose" onClick={onClose}>
            BACK
          </button>
          <span className="gameSettingsPanel__hint">
            <kbd>ESC</kbd> CLOSE
          </span>
        </div>
      </section>
    </div>
  );
}
