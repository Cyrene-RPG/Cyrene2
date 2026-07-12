import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameSettingsPanel from "../components/GameSettingsPanel";
import { useAuth } from "../hooks/useAuth";
import { leaveCity } from "../lib/desktop-controls";
import { isBetaDesktopClient } from "../lib/desktop-client";
import { CONTINUE_PATH, redirectToLogin } from "../lib/auth-routes";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import { fetchOperatorAvatars } from "../lib/operator-avatars";
import {
  formatResumeLabel,
  getResumeGamePath,
} from "../lib/player-progress";
import { signOutOperator } from "../lib/profiles";
import { isSupabaseConfigured } from "../lib/supabase";
import "./HomePage.css";
import "./ContinuePage.css";

type Choice = "resume" | "profile";

export default function ContinuePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isBetaDesktop = isBetaDesktopClient();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<Choice>("resume");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [resumePath, setResumePath] = useState(getResumeGamePath);

  const resumeLabel = formatResumeLabel(resumePath);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isBetaDesktop) {
      navigate("/", { replace: true });
      return;
    }
    if (loading) return;
    if (!user) {
      redirectToLogin(navigate, CONTINUE_PATH);
      return;
    }

    let cancelled = false;

    void fetchOperatorAvatars(user.id)
      .then((avatars) => {
        if (cancelled) return;
        if (avatars.length === 0) {
          navigate(PROFILE_PATH, { replace: true });
          return;
        }
        setResumePath(getResumeGamePath());
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) navigate("/", { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [isBetaDesktop, loading, navigate, user]);

  const confirm = useCallback(() => {
    if (selected === "resume") {
      navigate("/resume");
      return;
    }
    navigate("/profile");
  }, [navigate, selected]);

  useEffect(() => {
    if (!ready) return;

    function onKeyDown(event: KeyboardEvent) {
      if (settingsOpen || leaveOpen) return;

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setSelected("resume");
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setSelected("profile");
      }
      if (event.key === "Enter") {
        event.preventDefault();
        confirm();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setLeaveOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirm, leaveOpen, ready, settingsOpen]);

  async function handleLogout() {
    if (leaveBusy || !user) return;
    setLeaveBusy(true);
    try {
      await signOutOperator();
      setLeaveOpen(false);
      navigate("/", { replace: true });
    } catch {
      // Keep dialog open if sign-out fails.
    } finally {
      setLeaveBusy(false);
    }
  }

  const operatorId =
    user?.user_metadata?.username?.toUpperCase() ??
    user?.email?.split("@")[0]?.toUpperCase() ??
    "UNKNOWN";

  if (!ready) {
    return (
      <div className="gameScreen gameScreen--ready continueScreen">
        <div className="gameBg" />
        <div className="gameVignette" />
        <div className="gameScanlines" />
        <div className="menuAlert" style={{ margin: "auto", maxWidth: 420 }}>
          {loading ? "AUTH SCAN..." : "VERIFYING OPERATOR RECORD..."}
        </div>
      </div>
    );
  }

  return (
    <div className={`gameScreen continueScreen ${visible ? "gameScreen--ready" : ""}`}>
      <div className="gameBg" />
      <div className="gameVignette" />
      <div className="gameScanlines" />
      <div className="gameNoise" />

      <div className="hud hud--tl">
        <span className="hud__label">SYS</span>
        <span className="hud__value hud__value--online">ONLINE</span>
      </div>
      <div className="hud hud--tr">
        <span className="hud__label">NET</span>
        <span
          className={`hud__value ${isSupabaseConfigured ? "hud__value--online" : "hud__value--warn"}`}
        >
          {isSupabaseConfigured ? "LINKED" : "OFFLINE"}
        </span>
      </div>
      <div className="hud hud--bl">
        <span className="hud__label">OP</span>
        <span className="hud__value">{operatorId}</span>
      </div>
      <div className="hud hud--br">
        <span className="hud__label">SECTOR</span>
        <span className="hud__value">{resumeLabel}</span>
      </div>

      <div className="hudFrame hudFrame--tl" />
      <div className="hudFrame hudFrame--tr" />
      <div className="hudFrame hudFrame--bl" />
      <div className="hudFrame hudFrame--br" />

      <main className={`gameMain ${visible ? "gameMain--visible" : ""}`}>
        <section className="continueGate">
          <p className="continueGate__eyebrow">SESSION RESTORED</p>
          <h1 className="continueGate__title">WELCOME BACK</h1>
          <p className="continueGate__copy">Pick up the run or review your operator file.</p>

          <div className="continueChoices" role="listbox" aria-label="Session options">
            <button
              type="button"
              role="option"
              aria-selected={selected === "resume"}
              className={`continueChoice continueChoice--resume ${
                selected === "resume" ? "continueChoice--selected" : ""
              }`}
              onMouseEnter={() => setSelected("resume")}
              onClick={() => {
                setSelected("resume");
                navigate("/resume");
              }}
            >
              <span className="continueChoice__icon">▶</span>
              <span className="continueChoice__body">
                <span className="continueChoice__label">RESUME GAME</span>
                <span className="continueChoice__hint">
                  Drop back into {resumeLabel.toLowerCase()}
                </span>
              </span>
            </button>

            <button
              type="button"
              role="option"
              aria-selected={selected === "profile"}
              className={`continueChoice continueChoice--profile ${
                selected === "profile" ? "continueChoice--selected" : ""
              }`}
              onMouseEnter={() => setSelected("profile")}
              onClick={() => navigate("/profile")}
            >
              <span className="continueChoice__icon">◈</span>
              <span className="continueChoice__body">
                <span className="continueChoice__label">VIEW PROFILE</span>
                <span className="continueChoice__hint">
                  Operator file, avatars, and progress
                </span>
              </span>
            </button>
          </div>

          <div className="continueGate__footerLinks">
            <button
              type="button"
              className="continueGate__footerLink"
              onClick={() => setSettingsOpen(true)}
            >
              SETTINGS
            </button>
            <button
              type="button"
              className="continueGate__footerLink continueGate__footerLink--danger"
              onClick={() => setLeaveOpen(true)}
            >
              LEAVE
            </button>
          </div>
        </section>
      </main>

      <div className={`startPulse ${visible ? "startPulse--visible" : ""}`}>
        ENTER TO CONFIRM
      </div>

      <GameSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {leaveOpen ? (
        <div
          className="gameSettingsOverlay"
          role="presentation"
          onClick={() => setLeaveOpen(false)}
        >
          <section
            className="gameLeavePanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="continueLeaveTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="gameLeavePanel__eyebrow">DISCONNECT UPLINK</p>
            <h2 id="continueLeaveTitle" className="gameLeavePanel__title">
              LEAVE CITY?
            </h2>
            <p className="gameLeavePanel__copy">
              Close the client and keep your session, or sign out and return to
              the entry gate.
            </p>
            <div className="gameLeavePanel__actions gameLeavePanel__actions--wide">
              <button
                type="button"
                className="gameLeavePanel__stay"
                disabled={leaveBusy}
                onClick={() => setLeaveOpen(false)}
              >
                STAY
              </button>
              <button
                type="button"
                className="gameLeavePanel__leave"
                disabled={leaveBusy}
                onClick={() => leaveCity()}
              >
                CLOSE APP
              </button>
              <button
                type="button"
                className="gameLeavePanel__logout"
                disabled={leaveBusy}
                onClick={() => void handleLogout()}
              >
                {leaveBusy ? "SIGNING OUT..." : "LOG OUT"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
