import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isBetaDesktopClient } from "../lib/desktop-client";
import { LOGIN_PATH, SIGNUP_PATH } from "../lib/auth-routes";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import { isSupabaseConfigured } from "../lib/supabase";
import "./HomePage.css";
import "./IdentityGatePage.css";

const GATE_TICKER =
  "IDENTITY PROTOCOL ACTIVE // NEW OPERATORS REGISTER HERE // RETURNING PLAYERS AUTHENTICATE UPLINK // THE CITY REMEMBERS EVERY FILE";

type IdentityMode = "new" | "returning";

const MODE_COPY: Record<IdentityMode, string> = {
  new: "Forge a fresh operator file and claim your place in the sleepless city.",
  returning: "Authenticate your existing uplink and restore your operator session.",
};

export default function IdentityGatePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isBetaDesktop = isBetaDesktopClient();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<IdentityMode>("new");

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isBetaDesktop) {
      navigate(SIGNUP_PATH, { replace: true });
      return;
    }
    if (loading) return;
    if (user) {
      navigate(PROFILE_PATH, { replace: true });
    }
  }, [isBetaDesktop, loading, navigate, user]);

  const proceed = useCallback(() => {
    navigate(mode === "new" ? SIGNUP_PATH : LOGIN_PATH);
  }, [mode, navigate]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        setMode((current) => (current === "new" ? "returning" : "new"));
      }
      if (event.key === "Enter") {
        event.preventDefault();
        proceed();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        navigate("/");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, proceed]);

  if (!isBetaDesktop || loading || user) {
    return null;
  }

  return (
    <div className={`gameScreen identityScreen ${visible ? "gameScreen--ready" : ""}`}>
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
        <span className="hud__label">AUTH</span>
        <span className="hud__value">NO SESSION</span>
      </div>
      <div className="hud hud--br">
        <span className="hud__label">GATE</span>
        <span className="hud__value">ID-{mode === "new" ? "REG" : "AUTH"}</span>
      </div>

      <div className="hudFrame hudFrame--tl" />
      <div className="hudFrame hudFrame--tr" />
      <div className="hudFrame hudFrame--bl" />
      <div className="hudFrame hudFrame--br" />

      <main className={`gameMain ${visible ? "gameMain--visible" : ""}`}>
        <section className="identityGate">
          <p className="identityGate__eyebrow">IDENTITY PROTOCOL</p>
          <h1 className="identityGate__title">NEW IDENTITY</h1>
          <p className="identityGate__copy">{MODE_COPY[mode]}</p>

          <div
            className="identityToggle"
            role="tablist"
            aria-label="Operator type"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "new"}
              className={`identityToggle__option ${
                mode === "new" ? "identityToggle__option--active" : ""
              }`}
              onClick={() => setMode("new")}
            >
              NEW OPERATOR
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "returning"}
              className={`identityToggle__option identityToggle__option--returning ${
                mode === "returning" ? "identityToggle__option--active" : ""
              }`}
              onClick={() => setMode("returning")}
            >
              RETURNING PLAYER
            </button>
          </div>

          <div className="identityGate__actions">
            <button
              type="button"
              className={`identityGate__proceed ${
                mode === "returning" ? "identityGate__proceed--returning" : ""
              }`}
              onClick={proceed}
            >
              {mode === "new" ? "REGISTER IDENTITY" : "AUTHENTICATE UPLINK"}
            </button>
            <button
              type="button"
              className="identityGate__back"
              onClick={() => navigate("/")}
            >
              BACK
            </button>
          </div>
        </section>
      </main>

      <footer className={`gameFooter identityGate__footerTicker ${visible ? "gameFooter--visible" : ""}`}>
        <div className="loreTicker">
          <div className="loreTicker__track">{GATE_TICKER}</div>
        </div>
      </footer>

      <div className={`startPulse ${visible ? "startPulse--visible" : ""}`}>
        SELECT OPERATOR TYPE
      </div>
    </div>
  );
}
