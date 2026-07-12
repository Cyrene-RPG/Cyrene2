import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameSettingsPanel from "../components/GameSettingsPanel";
import { useAuth } from "../hooks/useAuth";
import { leaveCity } from "../lib/desktop-controls";
import { isBetaDesktopClient } from "../lib/desktop-client";
import {
  CONTINUE_PATH,
  IDENTITY_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
} from "../lib/auth-routes";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import { fetchOperatorAvatars } from "../lib/operator-avatars";
import { markHasPlayed } from "../lib/player-progress";
import { signOutOperator } from "../lib/profiles";
import { isSupabaseConfigured } from "../lib/supabase";
import "./HomePage.css";

const BANNER_STORAGE_KEY = "hideBanner";

type MenuItem = {
  id: string;
  label: string;
  sublabel: string;
  accent?: "purple" | "green" | "cyan" | "red";
} & (
  | { href: string }
  | { action: "settings" | "leave" }
);

const LORE_TICKER =
  "CYRENE IS A LIVING CITY // EVERY ACTION RECORDED // EVERY DECISION SHAPES YOUR FUTURE // SOME RISE TO POWER // SOME DISAPPEAR IN THE DARK // MOST ARE FORGOTTEN // WELCOME TO THE SLEEPLESS CITY OF SIN";

function getStatusText(loading: boolean, user: { email?: string } | null) {
  if (!isSupabaseConfigured) return "NETWORK OFFLINE";
  if (loading) return "AUTH SCAN";
  if (user) return "SESSION ACTIVE";
  return "NO SESSION";
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isBetaDesktop = isBetaDesktopClient();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [avatarCount, setAvatarCount] = useState<number | null>(null);

  const betaSimpleMenu =
    isBetaDesktop && (!user || avatarCount === 0);

  const betaReturningMenu =
    isBetaDesktop && Boolean(user) && avatarCount !== null && avatarCount > 0;

  const settingsItem = useMemo<MenuItem>(
    () => ({
      id: "settings",
      label: "SYSTEM SETTINGS",
      sublabel: "Display and client options",
      action: "settings",
      accent: "cyan",
    }),
    [],
  );

  const leaveItem = useMemo<MenuItem>(
    () => ({
      id: "leave",
      label: betaSimpleMenu ? "CLOSE GAME" : "LEAVE CITY",
      sublabel: betaSimpleMenu
        ? "Exit the Cyrene client"
        : betaReturningMenu
          ? "Sign out or close the client"
          : "Exit Cyrene and return to desktop",
      action: "leave",
      accent: "red",
    }),
    [betaReturningMenu, betaSimpleMenu],
  );

  const coreMenuItems = useMemo<MenuItem[]>(() => {
    if (betaSimpleMenu) {
      return [
        {
          id: "identity",
          label: "NEW IDENTITY",
          sublabel: user
            ? "Create your operator record"
            : "Register or authenticate your uplink",
          href: user ? PROFILE_PATH : IDENTITY_PATH,
          accent: "green",
        },
      ];
    }

    if (betaReturningMenu) {
      return [];
    }

    if (user) {
      return [
        {
          id: "enter",
          label: "ENTER CYRENE",
          sublabel: "Open the city map",
          href: "/city",
          accent: "green",
        },
        {
          id: "profile",
          label: "OPERATOR FILE",
          sublabel: "View identity and progress",
          href: "/profile",
          accent: "cyan",
        },
        {
          id: "creator",
          label: "CHARACTER FORGE",
          sublabel: "Profile page — redesign in progress",
          href: PROFILE_PATH,
          accent: "purple",
        },
      ];
    }

    return [
      {
        id: "signup",
        label: "NEW IDENTITY",
        sublabel: "Register and enter the city",
        href: SIGNUP_PATH,
        accent: "green",
      },
      {
        id: "login",
        label: "RESUME SESSION",
        sublabel: "Log in to an existing operator",
        href: LOGIN_PATH,
        accent: "cyan",
      },
      {
        id: "creator",
        label: "CHARACTER FORGE",
        sublabel: "Profile page — redesign in progress",
        href: PROFILE_PATH,
        accent: "purple",
      },
    ];
  }, [betaReturningMenu, betaSimpleMenu, user]);

  const menuItems = useMemo<MenuItem[]>(
    () => [...coreMenuItems, settingsItem, leaveItem],
    [coreMenuItems, leaveItem, settingsItem],
  );

  const menuLoading = isBetaDesktop && Boolean(user) && avatarCount === null && !loading;

  useEffect(() => {
    if (!isBetaDesktop) return;
    if (loading) return;

    if (!user) {
      setAvatarCount(null);
      return;
    }

    let cancelled = false;
    setAvatarCount(null);

    void fetchOperatorAvatars(user.id)
      .then((avatars) => {
        if (cancelled) return;
        if (avatars.length > 0) {
          markHasPlayed();
        }
        setAvatarCount(avatars.length);
      })
      .catch(() => {
        if (cancelled) return;
        setAvatarCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [isBetaDesktop, loading, user]);

  useEffect(() => {
    if (!betaReturningMenu) return;
    navigate(CONTINUE_PATH, { replace: true });
  }, [betaReturningMenu, navigate]);

  useEffect(() => {
    if (localStorage.getItem(BANNER_STORAGE_KEY) === "true") {
      setBannerVisible(false);
    }
    const timer = window.setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [menuItems.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 280);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = useCallback((item: MenuItem) => {
    if ("action" in item) {
      if (item.action === "settings") {
        setSettingsOpen(true);
        return;
      }
      if (item.action === "leave") {
        setLeaveOpen(true);
      }
      return;
    }

    if (item.href.startsWith("/") && !item.href.endsWith(".html")) {
      navigate(item.href);
      return;
    }
    window.location.href = item.href;
  }, [navigate]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (settingsOpen || leaveOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % menuItems.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + menuItems.length) % menuItems.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(menuItems[selectedIndex]);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuItems, selectedIndex, handleSelect, settingsOpen, leaveOpen]);

  function closeBanner() {
    setBannerVisible(false);
    localStorage.setItem(BANNER_STORAGE_KEY, "true");
  }

  async function handleLogout() {
    if (leaveBusy || !user) return;
    setLeaveBusy(true);
    try {
      await signOutOperator();
      setLeaveOpen(false);
      setAvatarCount(null);
    } catch {
      // Keep the dialog open if sign-out fails.
    } finally {
      setLeaveBusy(false);
    }
  }

  const showBetaLogout = isBetaDesktop && Boolean(user);
  const leavePanelTitle = isBetaDesktop
    ? betaSimpleMenu
      ? "CLOSE GAME?"
      : "LEAVE CITY?"
    : "LEAVE CITY?";
  const leavePanelCopy = isBetaDesktop
    ? showBetaLogout
      ? betaReturningMenu
        ? "Close the client and keep your session, or sign out and return to the title screen."
        : "Close the client, or sign out and return to the title screen."
      : "The client will close and return you to the desktop."
    : "Cyrene keeps running without you. Your client will close and return you to the desktop.";

  const status = getStatusText(loading, user);
  const operatorId = user?.email?.split("@")[0]?.toUpperCase() ?? "UNKNOWN";

  return (
    <div className={`gameScreen ${visible ? "gameScreen--ready" : ""}`}>
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
        <span className="hud__value">{status}</span>
        {user && <span className="hud__sub">OP:{operatorId}</span>}
      </div>
      <div className="hud hud--br">
        <span className="hud__label">BUILD</span>
        <span className="hud__value">0.1.0</span>
        {window.cyreneDesktop?.isDesktop && (
          <span className="hud__sub">DESKTOP</span>
        )}
      </div>

      <div className="hudFrame hudFrame--tl" />
      <div className="hudFrame hudFrame--tr" />
      <div className="hudFrame hudFrame--bl" />
      <div className="hudFrame hudFrame--br" />

      {bannerVisible && (
        <div
          className="devBanner"
          role="button"
          tabIndex={0}
          onClick={closeBanner}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              closeBanner();
            }
          }}
        >
          <span className="devBanner__icon">!</span>
          <span>
            ACTIVE DEVELOPMENT — Systems may change without notice
          </span>
        </div>
      )}

      <main className={`gameMain ${visible ? "gameMain--visible" : ""}`}>
        <section className="titleSection">
          <div className="titleEyebrow">INTERACTIVE RPG // CYBER FANTASY</div>
          <h1 className={`gameTitle ${glitch ? "gameTitle--glitch" : ""}`}>
            <span className="gameTitle__wrap">
              <span className="gameTitle__ghost gameTitle__ghost--red" aria-hidden>
                CYRENE
              </span>
              <span className="gameTitle__ghost gameTitle__ghost--cyan" aria-hidden>
                CYRENE
              </span>
              <span className="gameTitle__layer">CYRENE</span>
            </span>
          </h1>
          <p className="gameTagline">The Sleepless City of Sin</p>
          <div className="titleStats">
            <div className="statBar">
              <span className="statBar__label">WORLD SYNC</span>
              <div className="statBar__track">
                <div className="statBar__fill statBar__fill--purple" style={{ width: "87%" }} />
              </div>
            </div>
            <div className="statBar">
              <span className="statBar__label">THREAT LEVEL</span>
              <div className="statBar__track">
                <div className="statBar__fill statBar__fill--red" style={{ width: "64%" }} />
              </div>
            </div>
          </div>
        </section>

        <section className="menuSection">
          <div className="menuHeader">
            <span className="menuHeader__dot" />
            MAIN MENU
          </div>

          {!isSupabaseConfigured && (
            <div className="menuAlert">
              DATABASE OFFLINE — Configure Supabase in <code>.env</code>
            </div>
          )}

          {menuLoading || (betaReturningMenu && user) ? (
            <div className="menuAlert">SCANNING OPERATOR RECORD...</div>
          ) : (
            <nav className="gameMenu" aria-label="Main menu">
              {menuItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`gameMenuItem gameMenuItem--${item.accent} ${
                    index === selectedIndex ? "gameMenuItem--selected" : ""
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleSelect(item)}
                >
                  <span className="gameMenuItem__cursor">
                    {index === selectedIndex ? "▶" : " "}
                  </span>
                  <span className="gameMenuItem__text">
                    <span className="gameMenuItem__label">{item.label}</span>
                    <span className="gameMenuItem__sublabel">{item.sublabel}</span>
                  </span>
                  <span className="gameMenuItem__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              ))}
            </nav>
          )}
        </section>
      </main>

      <footer className={`gameFooter ${visible ? "gameFooter--visible" : ""}`}>
        <div className="loreTicker">
          <div className="loreTicker__track">{LORE_TICKER}</div>
        </div>
      </footer>

      <div className={`startPulse ${visible ? "startPulse--visible" : ""}`}>
        AWAITING INPUT
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
            aria-labelledby="leaveCityTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="gameLeavePanel__eyebrow">DISCONNECT UPLINK</p>
            <h2 id="leaveCityTitle" className="gameLeavePanel__title">
              {leavePanelTitle}
            </h2>
            <p className="gameLeavePanel__copy">{leavePanelCopy}</p>
            <div
              className={`gameLeavePanel__actions ${
                showBetaLogout ? "gameLeavePanel__actions--wide" : ""
              }`}
            >
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
                {isBetaDesktop ? "CLOSE APP" : "LEAVE CITY"}
              </button>
              {showBetaLogout ? (
                <button
                  type="button"
                  className="gameLeavePanel__logout"
                  disabled={leaveBusy}
                  onClick={() => void handleLogout()}
                >
                  {leaveBusy ? "SIGNING OUT..." : "LOG OUT"}
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
