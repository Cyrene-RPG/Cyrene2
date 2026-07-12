import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../hooks/useAuth";
import { CONTINUE_PATH, redirectToLogin } from "../lib/auth-routes";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import { isBetaDesktopClient } from "../lib/desktop-client";
import { resolveAvatarMissionResume, hasAvatarMissionProgress } from "../lib/mission-progress";
import {
  fetchOperatorAvatars,
  getActiveAvatarId,
  getAvatarDisplayName,
  getAvatarIdentificationNumber,
  getAvatarInitial,
  setActiveAvatarId,
  type OperatorAvatar,
} from "../lib/operator-avatars";
import {
  formatResumeLabel,
  getResumeGamePath,
  markHasPlayed,
} from "../lib/player-progress";
import { isSupabaseConfigured } from "../lib/supabase";
import "./HomePage.css";
import "./ResumeSessionPage.css";

type Phase = "loading" | "brief";

export default function ResumeSessionPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isBetaDesktop = isBetaDesktopClient();
  const [phase, setPhase] = useState<Phase>("loading");
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState<OperatorAvatar | null>(null);
  const [resumePath, setResumePath] = useState(getResumeGamePath);
  const [dataReady, setDataReady] = useState(false);

  const missionResume = useMemo(
    () => (avatar ? resolveAvatarMissionResume(avatar.id) : null),
    [avatar],
  );

  const sectorLabel = formatResumeLabel(resumePath);
  const hasSavedMissionProgress = avatar
    ? hasAvatarMissionProgress(avatar.id)
    : false;

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

        const activeId = getActiveAvatarId(user.id);
        const active =
          avatars.find((entry) => entry.id === activeId) ?? avatars[0] ?? null;

        if (active) {
          setActiveAvatarId(user.id, active.id);
          setAvatar(active);
        }

        setResumePath(getResumeGamePath());
        setDataReady(true);
      })
      .catch(() => {
        if (!cancelled) navigate(CONTINUE_PATH, { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [isBetaDesktop, loading, navigate, user]);

  useEffect(() => {
    if (phase !== "brief") return;
    const timer = window.setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [phase]);

  function enterMission() {
    if (!missionResume) return;
    markHasPlayed();
    window.location.href = missionResume.mission.path;
  }

  function enterSector() {
    markHasPlayed();
    navigate(resumePath);
  }

  if (phase === "loading") {
    return (
      <LoadingScreen
        variant="resume"
        authReady={dataReady}
        onComplete={() => setPhase("brief")}
      />
    );
  }

  if (!avatar || !missionResume) {
    return (
      <div className="gameScreen resumeSession">
        <div className="gameBg" />
        <div className="menuAlert" style={{ margin: "auto", maxWidth: 420 }}>
          RESTORING SESSION...
        </div>
      </div>
    );
  }

  const avatarName = getAvatarDisplayName(avatar).toUpperCase();
  const avatarId = getAvatarIdentificationNumber(avatar);

  return (
    <div
      className={`gameScreen resumeSession gameScreen--ready ${
        visible ? "gameScreen--ready" : ""
      }`}
    >
      <div className="gameBg" />
      <div className="gameVignette" />
      <div className="gameScanlines" />
      <div className="gameNoise" />

      <div className="hud hud--tl">
        <span className="hud__label">SYS</span>
        <span className="hud__value hud__value--online">SYNCED</span>
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
        <span className="hud__value">{avatarName}</span>
      </div>
      <div className="hud hud--br">
        <span className="hud__label">SECTOR</span>
        <span className="hud__value">{sectorLabel}</span>
      </div>

      <div className="hudFrame hudFrame--tl" />
      <div className="hudFrame hudFrame--tr" />
      <div className="hudFrame hudFrame--bl" />
      <div className="hudFrame hudFrame--br" />

      <main className={`gameMain ${visible ? "gameMain--visible" : ""}`}>
        <section className="resumeBrief">
          <p className="resumeBrief__eyebrow">SESSION RESTORED</p>
          <h1 className="resumeBrief__title">RESUME POINT</h1>

          <div className="resumeBrief__card">
            <div className="resumeBrief__avatarRow">
              <div className="resumeBrief__avatarMark">{getAvatarInitial(avatar)}</div>
              <div className="resumeBrief__avatarMeta">
                <span className="resumeBrief__avatarName">{avatarName}</span>
                <span className="resumeBrief__avatarId">ID {avatarId}</span>
              </div>
            </div>

            <span className="resumeBrief__missionLabel">ACTIVE MISSION</span>
            <span className="resumeBrief__missionTitle">
              {missionResume.mission.title.toUpperCase()}
            </span>
            <span className="resumeBrief__checkpoint">
              LAST SCENE · {missionResume.checkpoint.label.toUpperCase()}
            </span>
            <p className="resumeBrief__summary">{missionResume.checkpoint.summary}</p>
          </div>

          <div className="resumeBrief__actions">
            <button
              type="button"
              className="resumeBrief__primary"
              onClick={enterMission}
            >
              <span className="resumeBrief__actionLabel">
                {hasSavedMissionProgress ? "CONTINUE MISSION" : "START MISSION"}
              </span>
              <span className="resumeBrief__actionHint">
                {hasSavedMissionProgress
                  ? `Pick up at ${missionResume.checkpoint.label.toLowerCase()}`
                  : "Begin Welcome to Cyrene from the ferry deck"}
              </span>
            </button>

            <button
              type="button"
              className="resumeBrief__secondary"
              onClick={enterSector}
            >
              <span className="resumeBrief__actionLabel">
                ENTER {sectorLabel}
              </span>
              <span className="resumeBrief__actionHint">
                Drop into {sectorLabel.toLowerCase()} instead
              </span>
            </button>
          </div>

          <button
            type="button"
            className="resumeBrief__back"
            onClick={() => navigate(CONTINUE_PATH)}
          >
            ◀ BACK TO SESSION GATE
          </button>
        </section>
      </main>

      <div className={`startPulse ${visible ? "startPulse--visible" : ""}`}>
        SELECT YOUR DROP
      </div>
    </div>
  );
}
