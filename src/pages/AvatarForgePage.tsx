import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UnknownFigure from "../components/UnknownFigure";
import {
  AvatarForgePageHeader,
  AvatarForgePanelHeader,
  AvatarForgeShell,
  useAvatarForgeHud,
} from "../components/AvatarForgeShell";
import { SPECIES, type Species } from "../data/species";
import { speciesHasSubspecies } from "../data/subspecies";
import { goToMainMenu } from "../lib/avatar-forge-nav";
import { isPersonalAiHudActive } from "../lib/avatar-forge-hud";
import { useAuth } from "../hooks/useAuth";
import { loadAvatarDraft, saveAvatarDraft } from "../lib/avatar-draft";
import "./AvatarForgePage.css";

const TUTORIAL_MESSAGE =
  "First, start by choosing your species. Do mind though, each one comes with different bonuses and disadvantages.";

const PERSONAL_AI_MESSAGE =
  "Personal AI online. I'll configure your embodied shell — start with a species. Each form carries distinct strengths and tradeoffs.";

const MYSTERY_GUIDE_LINES = [
  "This is your imprint terminal — the interface between your mind and the body you'll wear in Cyrene.",
  "I've pulled up every reserve shell we had ready. Each species changes your strengths, your limits, and how the world reads you.",
  "Take your time. Look them over, compare the tradeoffs. When you're ready, confirm a species and we'll keep going.",
];

const GUIDE_CHAR_MS = 26;
const GUIDE_LINE_HOLD_MS = 900;

export default function AvatarForgePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const personalAiHud = isPersonalAiHudActive();
  const { figureVariant, prompt, panelClass } = useAvatarForgeHud();
  const tutorialMessage = personalAiHud ? PERSONAL_AI_MESSAGE : TUTORIAL_MESSAGE;
  const [guideComplete, setGuideComplete] = useState(() => !isPersonalAiHudActive());
  const [guideLineIndex, setGuideLineIndex] = useState(0);
  const [guideCharIndex, setGuideCharIndex] = useState(0);
  const [guideHoldComplete, setGuideHoldComplete] = useState(false);
  const [completedGuideLines, setCompletedGuideLines] = useState<string[]>([]);
  const [charIndex, setCharIndex] = useState(0);
  const [messageDone, setMessageDone] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => loadAvatarDraft().speciesId,
  );

  const displayedMessage = tutorialMessage.slice(0, charIndex);
  const isTyping = charIndex < tutorialMessage.length;

  const activeSpecies: Species | null =
    SPECIES.find((s) => s.id === (hoveredId ?? selectedId)) ?? null;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!personalAiHud || guideComplete) return;

    const activeLine = MYSTERY_GUIDE_LINES[guideLineIndex];
    if (!activeLine) {
      setGuideHoldComplete(true);
      return;
    }

    if (guideCharIndex < activeLine.length) {
      const timer = window.setTimeout(
        () => setGuideCharIndex((value) => value + 1),
        GUIDE_CHAR_MS,
      );
      return () => clearTimeout(timer);
    }

    const holdTimer = window.setTimeout(() => {
      setCompletedGuideLines((lines) => [...lines, activeLine]);
      setGuideCharIndex(0);
      setGuideLineIndex((index) => index + 1);
    }, GUIDE_LINE_HOLD_MS);

    return () => clearTimeout(holdTimer);
  }, [personalAiHud, guideComplete, guideLineIndex, guideCharIndex]);

  useEffect(() => {
    if (personalAiHud && !guideComplete) return;

    if (charIndex >= tutorialMessage.length) {
      const timer = window.setTimeout(() => setMessageDone(true), 400);
      return () => clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setCharIndex((c) => c + 1), 28);
    return () => clearTimeout(timer);
  }, [charIndex, tutorialMessage.length, personalAiHud, guideComplete]);

  function handleGuideExplore() {
    setGuideComplete(true);
    setCharIndex(tutorialMessage.length);
    setMessageDone(true);
  }

  function handleSelect(speciesId: string) {
    setSelectedId(speciesId);
    saveAvatarDraft({ speciesId });
  }

  function handleContinue() {
    if (!selectedId) return;
    saveAvatarDraft({ speciesId: selectedId, subspeciesId: null });

    if (speciesHasSubspecies(selectedId)) {
      navigate("/avatar-forge/subspecies");
      return;
    }

    navigate("/avatar-forge/identity");
  }

  const username =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "UNKNOWN";

  const showGuideOverlay = personalAiHud && !guideComplete;
  const activeGuideLine = MYSTERY_GUIDE_LINES[guideLineIndex] ?? "";
  const guideTyping =
    showGuideOverlay &&
    !guideHoldComplete &&
    guideCharIndex < activeGuideLine.length;
  const exploreReady = showGuideOverlay && guideHoldComplete;
  const canExplore = !personalAiHud || guideComplete;
  const speciesReady = canExplore && messageDone;

  return (
    <AvatarForgeShell
      username={username}
      stepLabel="01 / SPECIES"
      metaLabel="MODE"
      metaValue="TUTORIAL"
      brLabel="MODE"
      brValue="TUTORIAL"
    >
      <main className="avatarForge__main">
        <AvatarForgePageHeader
          eyebrow="AVATAR INITIALIZATION"
          title="AVATAR FORGE"
          subtitle="Construct your uploaded form"
          personalSubtitle="Configure your embodied interface"
        />

        <div
          className={`avatarForge__stage${
            showGuideOverlay ? " avatarForge__stage--guided" : ""
          }`}
        >
          {showGuideOverlay ? (
            <div className="avatarForge__guideOverlay">
              <div className="avatarForge__guidePanel">
                {completedGuideLines.map((line) => (
                  <p key={line} className="avatarForge__guideLine avatarForge__guideLine--done">
                    <span className="avatarForge__guideLabel">???</span>
                    {line}
                  </p>
                ))}

                {!guideHoldComplete && activeGuideLine ? (
                  <p className="avatarForge__guideLine avatarForge__guideLine--active">
                    <span className="avatarForge__guideLabel">???</span>
                    {activeGuideLine.slice(0, guideCharIndex)}
                    {guideTyping ? (
                      <span className="avatarForge__cursor">|</span>
                    ) : null}
                  </p>
                ) : null}

                {exploreReady ? (
                  <button
                    type="button"
                    className="avatarForge__guideExplore"
                    onClick={handleGuideExplore}
                  >
                    <span className="avatarForge__continueCursor">▶</span>
                    EXPLORE
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="avatarForge__figureWrap">
            <UnknownFigure variant={figureVariant} />
          </div>

          <div className={`avatarForge__panel${panelClass}`}>
            <AvatarForgePanelHeader />

            <div className="avatarForge__message">
              <p className="avatarForge__messageLine">
                <span className="avatarForge__prompt">{prompt}</span>
                {canExplore ? (
                  <>
                    {displayedMessage}
                    {isTyping && <span className="avatarForge__cursor">|</span>}
                  </>
                ) : (
                  "Stand by — assistant briefing in progress..."
                )}
              </p>
            </div>

            <div
              className={`avatarForge__speciesSection ${
                speciesReady ? "avatarForge__speciesSection--ready" : ""
              }`}
            >
              <div className="avatarForge__speciesHeader">SELECT SPECIES</div>

              <div className="avatarForge__workArea">
                <ul className="avatarForge__speciesList">
                  {SPECIES.map((species) => {
                    const isSelected = selectedId === species.id;
                    const isHovered = hoveredId === species.id;

                    return (
                      <li key={species.id}>
                        <button
                          type="button"
                          className={`avatarForge__speciesBtn ${isSelected ? "avatarForge__speciesBtn--selected" : ""} ${isHovered ? "avatarForge__speciesBtn--hovered" : ""}`}
                          onMouseEnter={() => setHoveredId(species.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(species.id)}
                          onBlur={() => setHoveredId(null)}
                          disabled={!speciesReady}
                          onClick={() => handleSelect(species.id)}
                        >
                          <span className="avatarForge__speciesName">
                            {species.name}
                          </span>
                          <span className="avatarForge__speciesTag">
                            {species.tagline}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="avatarForge__detail">
                  {activeSpecies ? (
                    <>
                      <div className="avatarForge__detailName">
                        {activeSpecies.name}
                      </div>
                      <p className="avatarForge__detailDesc">
                        {activeSpecies.description}
                      </p>
                      <div className="avatarForge__detailBlock">
                        <span className="avatarForge__detailLabel">Bonuses</span>
                        <ul>
                          {activeSpecies.bonuses.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="avatarForge__detailBlock avatarForge__detailBlock--warn">
                        <span className="avatarForge__detailLabel">
                          Disadvantages
                        </span>
                        <ul>
                          {activeSpecies.disadvantages.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p className="avatarForge__detailEmpty">
                      Hover a species to view bonuses and disadvantages.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="avatarForge__actions">
              <button
                type="button"
                className="avatarForge__backBtn"
                onClick={() => goToMainMenu(navigate)}
              >
                <span className="avatarForge__backCursor">◀</span>
                MAIN MENU
              </button>

              <button
                type="button"
                className="avatarForge__continue"
                disabled={!selectedId || !speciesReady}
                onClick={handleContinue}
              >
                <span className="avatarForge__continueCursor">▶</span>
                CONFIRM SPECIES
              </button>
            </div>
          </div>
        </div>
      </main>
    </AvatarForgeShell>
  );
}
