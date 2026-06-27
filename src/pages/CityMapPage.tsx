import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CITY_LEVELS,
  getDefaultCityLevelId,
  getLocationsForLevel,
  LOWER_1_BLOCKS,
  type CityLevel,
  type CityLocation,
} from "../data/city-levels";
import { useAuth } from "../hooks/useAuth";
import { useAdminAccess } from "../hooks/useAdminAccess";
import { redirectToLogin } from "../lib/auth-routes";
import { getCityLocationBuildPath } from "../lib/admin-access";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import { getLocationPath, MISSIONS_PATH } from "../lib/city-config";
import { GATE_NINE_MOTEL_ID } from "../data/gate-nine-motel";
import {
  fetchOperatorAvatars,
  getActiveOperatorAvatar,
  getAvatarDisplayName,
} from "../lib/operator-avatars";
import "./CityMapPage.css";

export default function CityMapPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeLevelId, setActiveLevelId] = useState(getDefaultCityLevelId());
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);

  const activeLevel = useMemo(
    () => CITY_LEVELS.find((level) => level.id === activeLevelId),
    [activeLevelId],
  );
  const locations = useMemo(
    () => getLocationsForLevel(activeLevelId),
    [activeLevelId],
  );
  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) ?? null,
    [locations, selectedLocationId],
  );

  const lowerLevels = CITY_LEVELS.filter((level) => level.region === "lower");
  const upperLevels = CITY_LEVELS.filter((level) => level.region === "upper");

  const operatorLabel = useMemo(
    () =>
      (
        user?.user_metadata?.username ??
        user?.email?.split("@")[0] ??
        "UNKNOWN"
      ).toUpperCase(),
    [user],
  );
  const { isAdmin } = useAdminAccess();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      redirectToLogin(navigate, "/city");
      return;
    }

    let cancelled = false;

    fetchOperatorAvatars(user.id)
      .then(() => {
        if (cancelled) return;
        const active = getActiveOperatorAvatar(user.id);
        setActiveCharacter(active ? getAvatarDisplayName(active) : null);
      })
      .catch(() => {
        if (!cancelled) setActiveCharacter(null);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    setSelectedLocationId(null);
  }, [activeLevelId]);

  function handleLevelSelect(level: CityLevel) {
    if (!level.available) {
      setNotice(level.lockedReason ?? "This city level is not accessible yet.");
      return;
    }
    setActiveLevelId(level.id);
    setNotice(null);
  }

  function handleLocationSelect(location: CityLocation) {
    setSelectedLocationId(location.id);

    if (location.status === "open" && location.href) {
      navigate(location.href);
      return;
    }

    if (location.status === "open" && !location.href) {
      navigate(getLocationPath(location.id));
      return;
    }

    if (isAdmin) {
      setNotice(null);
      if (location.id === GATE_NINE_MOTEL_ID) {
        navigate(getLocationPath(location.id));
        return;
      }
      navigate(getCityLocationBuildPath(location.id));
      return;
    }

    if (location.status === "story") {
      setNotice(
        location.lockedReason ?? "Resume the story in Missions to access this location.",
      );
      return;
    }

    setNotice(location.lockedReason ?? "Location offline.");
  }

  if (loading || !user) {
    return (
      <div className="cityMapPage">
        <div className="cityMapPage__bg" />
        <div className="cityMapPage__loading">LOADING CITY MAP...</div>
      </div>
    );
  }

  return (
    <div className="cityMapPage">
      <div className="cityMapPage__bg" />
      <div className="cityMapPage__scanlines" />
      <div className="cityMapPage__vignette" />

      <div className="cityMapPage__hud cityMapPage__hud--tl">
        <span>MODULE</span>
        <span className="cityMapPage__hudVal">CITY-MAP</span>
      </div>
      <div className="cityMapPage__hud cityMapPage__hud--tr">
        <span>OPERATOR</span>
        <span className="cityMapPage__hudVal cityMapPage__hudVal--accent">
          {operatorLabel}
        </span>
      </div>
      {activeCharacter ? (
        <div className="cityMapPage__hud cityMapPage__hud--bl">
          <span>ACTIVE FORM</span>
          <span className="cityMapPage__hudVal">{activeCharacter.toUpperCase()}</span>
        </div>
      ) : null}
      {isAdmin ? (
        <div className="cityMapPage__hud cityMapPage__hud--br">
          <span>ACCESS</span>
          <span className="cityMapPage__hudVal cityMapPage__hudVal--admin">
            ADMIN BUILD
          </span>
        </div>
      ) : null}

      <main className="cityMapPage__main">
        <header className="cityMapPage__header">
          <p className="cityMapPage__eyebrow">NAVIGATION GRID</p>
          <h1 className="cityMapPage__title">CYRENE</h1>
          <p className="cityMapPage__subtitle">
            {activeLevel?.description ??
              "Select a district to visit. Story missions unlock new sectors."}
          </p>
        </header>

        <div className="cityMapPage__stage">
          <aside className="cityMapPage__levels" aria-label="City levels">
            <p className="cityMapPage__levelsTitle">CITY LEVELS</p>

            <div className="cityMapPage__levelsGroup">
              <p className="cityMapPage__levelsGroupLabel">Lower City</p>
              {lowerLevels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className={`cityMapPage__levelBtn${
                    level.id === activeLevelId
                      ? " cityMapPage__levelBtn--active"
                      : ""
                  }${level.available ? "" : " cityMapPage__levelBtn--locked"}`}
                  onClick={() => handleLevelSelect(level)}
                >
                  <span className="cityMapPage__levelShort">{level.shortLabel}</span>
                  <span className="cityMapPage__levelCopy">
                    <span className="cityMapPage__levelName">{level.label}</span>
                    {!level.available ? (
                      <span className="cityMapPage__levelMeta">SEALED</span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>

            <div className="cityMapPage__levelsGroup">
              <p className="cityMapPage__levelsGroupLabel">Upper City</p>
              {upperLevels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className={`cityMapPage__levelBtn cityMapPage__levelBtn--upper${
                    level.id === activeLevelId
                      ? " cityMapPage__levelBtn--active"
                      : ""
                  }${level.available ? "" : " cityMapPage__levelBtn--locked"}`}
                  onClick={() => handleLevelSelect(level)}
                >
                  <span className="cityMapPage__levelShort">{level.shortLabel}</span>
                  <span className="cityMapPage__levelCopy">
                    <span className="cityMapPage__levelName">{level.label}</span>
                    <span className="cityMapPage__levelMeta">SEALED</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div className="cityMapPage__mapShell">
            <div className="cityMapPage__mapHeader">
              <span className="cityMapPage__mapRegion">
                {activeLevel?.region === "upper" ? "UPPER CITY" : "LOWER CITY"}
              </span>
              <span className="cityMapPage__mapLevelLabel">
                Level {activeLevel?.levelNumber} — {activeLevel?.label}
              </span>
            </div>

            <div className="cityMapPage__mapGrid" aria-hidden="true" />

            {activeLevelId === "lower-1"
              ? LOWER_1_BLOCKS.map((block) => (
                  <div
                    key={block.id}
                    className={`cityMapPage__block${
                      "offline" in block && block.offline
                        ? " cityMapPage__block--offline"
                        : ""
                    }`}
                    style={{
                      left: `${block.x}%`,
                      top: `${block.y}%`,
                      width: `${block.w}%`,
                      height: `${block.h}%`,
                    }}
                    aria-hidden="true"
                  >
                    {"label" in block ? (
                      <span className="cityMapPage__blockLabel">{block.label}</span>
                    ) : null}
                  </div>
                ))
              : null}

            <div className="cityMapPage__mapPulse" aria-hidden="true" />

            {locations.map((location) => {
              const isLodging = location.kind === "lodging";
              const mapTagline = location.pinTagline ?? location.tagline;

              return (
              <button
                key={location.id}
                type="button"
                className={`cityMapPage__pin cityMapPage__pin--${location.status}${
                  isLodging ? " cityMapPage__pin--lodging" : ""
                }${isAdmin ? " cityMapPage__pin--admin" : ""}${
                  selectedLocationId === location.id
                    ? " cityMapPage__pin--selected"
                    : ""
                }`}
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                onClick={() => handleLocationSelect(location)}
              >
                <span className="cityMapPage__pinDot" />
                <span className="cityMapPage__pinLabel">{location.name}</span>
                <span className="cityMapPage__pinTag">{mapTagline}</span>
              </button>
              );
            })}
          </div>

          <aside className="cityMapPage__detail">
            {selectedLocation ? (
              <>
                <p className="cityMapPage__detailEyebrow">
                  {selectedLocation.kind.toUpperCase()}
                </p>
                <h2 className="cityMapPage__detailTitle">{selectedLocation.name}</h2>
                <p className="cityMapPage__detailTag">{selectedLocation.tagline}</p>
                <p className="cityMapPage__detailBody">
                  {selectedLocation.description}
                </p>
                {selectedLocation.status === "story" ? (
                  <button
                    type="button"
                    className="cityMapPage__detailAction"
                    onClick={() => navigate(MISSIONS_PATH)}
                  >
                    GO TO MISSIONS
                  </button>
                ) : null}
                {selectedLocation.status === "open" && selectedLocation.href ? (
                  <button
                    type="button"
                    className="cityMapPage__detailAction"
                    onClick={() => navigate(selectedLocation.href!)}
                  >
                    ENTER
                  </button>
                ) : null}
                {isAdmin &&
                !(selectedLocation.status === "open" && selectedLocation.href) &&
                selectedLocation.id !== GATE_NINE_MOTEL_ID ? (
                  <button
                    type="button"
                    className="cityMapPage__detailAction cityMapPage__detailAction--admin"
                    onClick={() => navigate(getCityLocationBuildPath(selectedLocation.id))}
                  >
                    OPEN BUILD SURFACE
                  </button>
                ) : null}
                {isAdmin && selectedLocation.id === GATE_NINE_MOTEL_ID ? (
                  <button
                    type="button"
                    className="cityMapPage__detailAction"
                    onClick={() => navigate(getLocationPath(selectedLocation.id))}
                  >
                    VISIT
                  </button>
                ) : null}
              </>
            ) : (
              <>
                <p className="cityMapPage__detailEyebrow">PORT QUARTER</p>
                <h2 className="cityMapPage__detailTitle">Select a location</h2>
                <p className="cityMapPage__detailBody">
                  Lower Level 1 is the arrival zone — entry gate, guides, supplies,
                  and the last regulated blocks before the undercity.
                </p>
                <ul className="cityMapPage__legendList">
                  <li>
                    <span className="cityMapPage__legendSwatch cityMapPage__legendSwatch--open" />
                    Open travel
                  </li>
                  <li>
                    <span className="cityMapPage__legendSwatch cityMapPage__legendSwatch--story" />
                    Story / authorization
                  </li>
                  <li>
                    <span className="cityMapPage__legendSwatch cityMapPage__legendSwatch--locked" />
                    Locked until cleared
                  </li>
                </ul>
              </>
            )}
            {notice ? (
              <p className="cityMapPage__notice" role="status">
                {notice}
              </p>
            ) : null}
          </aside>
        </div>

        <div className="cityMapPage__actions">
          <button
            type="button"
            className="cityMapPage__backBtn"
            onClick={() => navigate(PROFILE_PATH)}
          >
            <span className="cityMapPage__backCursor">◀</span>
            OPERATOR FILE
          </button>
          <button
            type="button"
            className="cityMapPage__missionsBtn"
            onClick={() => navigate(MISSIONS_PATH)}
          >
            <span className="cityMapPage__missionsCursor">▶</span>
            MISSIONS
          </button>
        </div>
      </main>
    </div>
  );
}
