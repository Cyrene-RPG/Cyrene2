import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { redirectToLogin } from "../lib/auth-routes";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import { CITY_PATH, WELCOME_MISSION_PATH } from "../lib/city-config";
import "./MissionsPage.css";

type MissionCard = {
  id: string;
  title: string;
  status: "active" | "locked" | "hidden";
  description?: string;
};

const MISSIONS: MissionCard[] = [
  {
    id: "welcome",
    title: "Welcome to Cyrene",
    status: "active",
    description: "Clear customs, meet the city, and begin your record.",
  },
  {
    id: "port",
    title: "Enter the Port",
    status: "locked",
    description: "Complete Welcome to Cyrene first.",
  },
  {
    id: "unknown",
    title: "???",
    status: "hidden",
  },
];

export default function MissionsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const operatorLabel = useMemo(
    () =>
      (
        user?.user_metadata?.username ??
        user?.email?.split("@")[0] ??
        "UNKNOWN"
      ).toUpperCase(),
    [user],
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      redirectToLogin(navigate, "/missions");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!confirmOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setConfirmOpen(false);
        setSelectedMissionId(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen]);

  function handleMissionSelect(mission: MissionCard) {
    if (mission.status !== "active") return;
    setSelectedMissionId(mission.id);
    setConfirmOpen(true);
  }

  function handleConfirmStart() {
    if (selectedMissionId === "welcome") {
      window.location.href = WELCOME_MISSION_PATH;
    }
  }

  if (loading || !user) {
    return (
      <div className="missionsPage">
        <div className="missionsPage__bg" />
        <div className="missionsPage__loading">LOADING MISSION GRID...</div>
      </div>
    );
  }

  return (
    <div className="missionsPage">
      <div className="missionsPage__bg" />
      <div className="missionsPage__scanlines" />
      <div className="missionsPage__vignette" />

      <div className="missionsPage__hud missionsPage__hud--tl">
        <span>MODULE</span>
        <span className="missionsPage__hudVal">MISSION-GRID</span>
      </div>
      <div className="missionsPage__hud missionsPage__hud--tr">
        <span>OPERATOR</span>
        <span className="missionsPage__hudVal missionsPage__hudVal--accent">
          {operatorLabel}
        </span>
      </div>

      <main className="missionsPage__main">
        <header className="missionsPage__header">
          <p className="missionsPage__eyebrow">STORY UPLINK</p>
          <h1 className="missionsPage__title">MISSIONS</h1>
          <p className="missionsPage__subtitle">
            Resume your narrative here. The city map opens districts as contracts
            progress.
          </p>
        </header>

        <div className="missionsPage__grid">
          {MISSIONS.map((mission) => (
            <button
              key={mission.id}
              type="button"
              className={`missionsPage__card missionsPage__card--${mission.status}`}
              disabled={mission.status !== "active"}
              onClick={() => handleMissionSelect(mission)}
            >
              <span className="missionsPage__cardTitle">{mission.title}</span>
              {mission.description ? (
                <span className="missionsPage__cardDesc">{mission.description}</span>
              ) : null}
              {mission.status === "active" ? (
                <span className="missionsPage__cardAction">RESUME</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="missionsPage__actions">
          <button
            type="button"
            className="missionsPage__backBtn"
            onClick={() => navigate(PROFILE_PATH)}
          >
            <span className="missionsPage__backCursor">◀</span>
            OPERATOR FILE
          </button>
          <button
            type="button"
            className="missionsPage__cityBtn"
            onClick={() => navigate(CITY_PATH)}
          >
            CITY MAP
          </button>
        </div>
      </main>

      {confirmOpen ? (
        <div
          className="missionsPage__overlay"
          role="presentation"
          onClick={() => {
            setConfirmOpen(false);
            setSelectedMissionId(null);
          }}
        >
          <section
            className="missionsPage__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="missionsConfirmTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="missionsConfirmTitle" className="missionsPage__dialogTitle">
              START MISSION
            </h2>
            <p className="missionsPage__dialogText">
              Resume mission &quot;Welcome to Cyrene&quot;?
            </p>
            <div className="missionsPage__dialogActions">
              <button
                type="button"
                className="missionsPage__dialogBtn missionsPage__dialogBtn--ghost"
                onClick={() => {
                  setConfirmOpen(false);
                  setSelectedMissionId(null);
                }}
              >
                NOT YET
              </button>
              <button
                type="button"
                className="missionsPage__dialogBtn missionsPage__dialogBtn--primary"
                onClick={handleConfirmStart}
              >
                BEGIN
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
