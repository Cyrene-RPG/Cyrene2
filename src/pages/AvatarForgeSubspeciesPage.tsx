import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UnknownFigure from "../components/UnknownFigure";
import {
  AvatarForgePageHeader,
  AvatarForgePanelHeader,
  AvatarForgeShell,
  useAvatarForgeHud,
} from "../components/AvatarForgeShell";
import { getSpeciesById } from "../data/species";
import {
  getSubspeciesForSpecies,
  speciesHasSubspecies,
  type Subspecies,
} from "../data/subspecies";
import { useAuth } from "../hooks/useAuth";
import { loadAvatarDraft, saveAvatarDraft } from "../lib/avatar-draft";
import "./AvatarForgePage.css";

const TUTORIAL_MESSAGE =
  "Good. Now narrow your form — choose your subspecies. This locks your lineage bonuses and disadvantages.";

export default function AvatarForgeSubspeciesPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const draft = loadAvatarDraft();
  const parentSpecies = draft.speciesId
    ? getSpeciesById(draft.speciesId)
    : undefined;
  const options = useMemo(
    () => (draft.speciesId ? getSubspeciesForSpecies(draft.speciesId) : []),
    [draft.speciesId],
  );

  const [charIndex, setCharIndex] = useState(0);
  const [messageDone, setMessageDone] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => loadAvatarDraft().subspeciesId,
  );

  const displayedMessage = TUTORIAL_MESSAGE.slice(0, charIndex);
  const isTyping = charIndex < TUTORIAL_MESSAGE.length;

  const activeSubspecies: Subspecies | null =
    options.find((s) => s.id === (hoveredId ?? selectedId)) ?? null;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (
      !draft.speciesId ||
      !speciesHasSubspecies(draft.speciesId) ||
      options.length === 0
    ) {
      navigate("/avatar-forge", { replace: true });
    }
  }, [draft.speciesId, options.length, navigate]);

  useEffect(() => {
    if (charIndex >= TUTORIAL_MESSAGE.length) {
      const timer = window.setTimeout(() => setMessageDone(true), 400);
      return () => clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setCharIndex((c) => c + 1), 28);
    return () => clearTimeout(timer);
  }, [charIndex]);

  function handleSelect(subspeciesId: string) {
    setSelectedId(subspeciesId);
    saveAvatarDraft({ subspeciesId });
  }

  function handleBack() {
    saveAvatarDraft({ subspeciesId: null });
    navigate("/avatar-forge");
  }

  function handleContinue() {
    if (!selectedId) return;
    saveAvatarDraft({ subspeciesId: selectedId });
    navigate("/avatar-forge/identity");
  }

  const username =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "UNKNOWN";

  const { figureVariant, prompt, panelClass } = useAvatarForgeHud();

  return (
    <AvatarForgeShell
      username={username}
      stepLabel="02 / SUBSPECIES"
      metaLabel="LINEAGE"
      metaValue={parentSpecies?.name.toUpperCase() ?? "UNKNOWN"}
    >
      <main className="avatarForge__main">
        <AvatarForgePageHeader
          eyebrow="LINEAGE SELECTION"
          title="AVATAR FORGE"
          subtitle={`${parentSpecies?.name ?? "Species"} — choose your subspecies`}
          personalEyebrow="LINEAGE IMPRINT"
          personalSubtitle="Narrow your reserve shell lineage"
        />

        <div className="avatarForge__stage">
          <div className="avatarForge__figureWrap">
            <UnknownFigure variant={figureVariant} />
          </div>

          <div className={`avatarForge__panel${panelClass}`}>
            <AvatarForgePanelHeader />

            <div className="avatarForge__message">
              <p className="avatarForge__messageLine">
                <span className="avatarForge__prompt">{prompt}</span>
                {displayedMessage}
                {isTyping && <span className="avatarForge__cursor">|</span>}
              </p>
            </div>

            <div
              className={`avatarForge__speciesSection ${messageDone ? "avatarForge__speciesSection--ready" : ""}`}
            >
              <div className="avatarForge__speciesHeader">
                SELECT SUBSPECIES
              </div>

              <div className="avatarForge__workArea">
                <ul className="avatarForge__speciesList">
                  {options.map((sub) => {
                    const isSelected = selectedId === sub.id;
                    const isHovered = hoveredId === sub.id;

                    return (
                      <li key={sub.id}>
                        <button
                          type="button"
                          className={`avatarForge__speciesBtn ${isSelected ? "avatarForge__speciesBtn--selected" : ""} ${isHovered ? "avatarForge__speciesBtn--hovered" : ""}`}
                          onMouseEnter={() => setHoveredId(sub.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(sub.id)}
                          onBlur={() => setHoveredId(null)}
                          onClick={() => handleSelect(sub.id)}
                        >
                          <span className="avatarForge__speciesName">
                            {sub.name}
                          </span>
                          <span className="avatarForge__speciesTag">
                            {sub.tagline}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="avatarForge__detail">
                  {activeSubspecies ? (
                    <>
                      <div className="avatarForge__detailName">
                        {activeSubspecies.name}
                      </div>
                      <p className="avatarForge__detailDesc">
                        {activeSubspecies.description}
                      </p>
                      <div className="avatarForge__detailBlock">
                        <span className="avatarForge__detailLabel">Bonuses</span>
                        <ul>
                          {activeSubspecies.bonuses.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="avatarForge__detailBlock avatarForge__detailBlock--warn">
                        <span className="avatarForge__detailLabel">
                          Disadvantages
                        </span>
                        <ul>
                          {activeSubspecies.disadvantages.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p className="avatarForge__detailEmpty">
                      Hover a subspecies to view bonuses and disadvantages.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="avatarForge__actions">
              <button
                type="button"
                className="avatarForge__backBtn"
                onClick={handleBack}
              >
                <span className="avatarForge__backCursor">◀</span>
                CHANGE SPECIES
              </button>

              <button
                type="button"
                className="avatarForge__continue"
                disabled={!selectedId}
                onClick={handleContinue}
              >
                <span className="avatarForge__continueCursor">▶</span>
                CONFIRM SUBSPECIES
              </button>
            </div>
          </div>
        </div>
      </main>
    </AvatarForgeShell>
  );
}
