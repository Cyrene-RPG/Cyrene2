import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UnknownFigure from "../components/UnknownFigure";
import {
  AvatarForgePageHeader,
  AvatarForgePanelHeader,
  AvatarForgeShell,
  useAvatarForgeHud,
} from "../components/AvatarForgeShell";
import {
  CLASSES,
  classHasSubclasses,
  getClassBonuses,
  getSubclassesForClass,
  type CharacterClass,
  type ClassSubclass,
} from "../data/classes";
import { getSpeciesById } from "../data/species";
import { getSubspeciesById } from "../data/subspecies";
import { useAuth } from "../hooks/useAuth";
import {
  formatCharacterName,
  loadAvatarDraft,
  saveAvatarDraft,
  validateIdentity,
} from "../lib/avatar-draft";
import "./AvatarForgePage.css";

const TUTORIAL_MESSAGE =
  "Identity imprinted. Now choose your class — the role your avatar will play in Cyrene. Each path grants different skill bonuses.";

export default function AvatarForgeClassPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const draft = loadAvatarDraft();
  const parentSpecies = draft.speciesId
    ? getSpeciesById(draft.speciesId)
    : undefined;
  const parentSubspecies = draft.subspeciesId
    ? getSubspeciesById(draft.subspeciesId)
    : undefined;

  const [charIndex, setCharIndex] = useState(0);
  const [messageDone, setMessageDone] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => loadAvatarDraft().classId,
  );
  const [selectedSubclassId, setSelectedSubclassId] = useState<string | null>(
    () => loadAvatarDraft().subclassId,
  );

  const displayedMessage = TUTORIAL_MESSAGE.slice(0, charIndex);
  const isTyping = charIndex < TUTORIAL_MESSAGE.length;

  const activeClass: CharacterClass | null =
    CLASSES.find((entry) => entry.id === (hoveredId ?? selectedId)) ?? null;

  const subclassOptions = useMemo(
    () => (selectedId ? getSubclassesForClass(selectedId) : []),
    [selectedId],
  );

  const activeSubclass: ClassSubclass | null =
    subclassOptions.find((entry) => entry.id === selectedSubclassId) ?? null;

  const canContinue =
    Boolean(selectedId) &&
    (!selectedId ||
      !classHasSubclasses(selectedId) ||
      Boolean(selectedSubclassId));

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const current = loadAvatarDraft();
    if (!current.speciesId || !validateIdentity(current).valid) {
      navigate("/avatar-forge/identity", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (charIndex >= TUTORIAL_MESSAGE.length) {
      const timer = window.setTimeout(() => setMessageDone(true), 400);
      return () => clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setCharIndex((c) => c + 1), 28);
    return () => clearTimeout(timer);
  }, [charIndex]);

  function handleSelect(classId: string) {
    setSelectedId(classId);
    if (!classHasSubclasses(classId)) {
      setSelectedSubclassId(null);
      saveAvatarDraft({ classId, subclassId: null });
      return;
    }
    saveAvatarDraft({ classId });
  }

  function handleSelectSubclass(subclassId: string) {
    setSelectedSubclassId(subclassId);
    saveAvatarDraft({ subclassId });
  }

  function handleBack() {
    navigate("/avatar-forge/identity");
  }

  function handleContinue() {
    if (!selectedId || !canContinue) return;
    saveAvatarDraft({
      classId: selectedId,
      subclassId: selectedSubclassId,
    });
    navigate("/avatar-forge/stats", { replace: true });
  }

  const username =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "UNKNOWN";

  const characterName = formatCharacterName(draft.displayName, draft.lastName);
  const lineageLabel = parentSubspecies
    ? `${parentSpecies?.name ?? "Species"} / ${parentSubspecies.name}`
    : (parentSpecies?.name ?? "Species");

  const { figureVariant, prompt, panelClass } = useAvatarForgeHud();

  return (
    <AvatarForgeShell
      username={username}
      stepLabel="04 / CLASS"
      metaLabel="AVATAR"
      metaValue={
        characterName !== "—" ? characterName.toUpperCase() : "UNNAMED"
      }
    >
      <main className="avatarForge__main">
        <AvatarForgePageHeader
          eyebrow="ROLE ASSIGNMENT"
          title="AVATAR FORGE"
          subtitle="Choose the class your avatar will embody in Cyrene"
          personalEyebrow="ROLE ASSIGNMENT"
          personalSubtitle="Choose your role in Cyrene"
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
              <div className="avatarForge__speciesHeader">SELECT CLASS</div>

              <div className="avatarForge__workArea">
                <ul className="avatarForge__speciesList">
                  {CLASSES.map((characterClass) => {
                    const isSelected = selectedId === characterClass.id;
                    const isHovered = hoveredId === characterClass.id;

                    return (
                      <li key={characterClass.id}>
                        <button
                          type="button"
                          className={`avatarForge__speciesBtn ${isSelected ? "avatarForge__speciesBtn--selected" : ""} ${isHovered ? "avatarForge__speciesBtn--hovered" : ""}`}
                          onMouseEnter={() => setHoveredId(characterClass.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(characterClass.id)}
                          onBlur={() => setHoveredId(null)}
                          onClick={() => handleSelect(characterClass.id)}
                        >
                          <span className="avatarForge__speciesName">
                            {characterClass.name}
                          </span>
                          <span className="avatarForge__speciesTag">
                            {characterClass.tagline}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="avatarForge__detail">
                  {activeClass ? (
                    <>
                      <div className="avatarForge__detailName">
                        {activeClass.name}
                      </div>
                      <p className="avatarForge__detailDesc">
                        {activeClass.description}
                      </p>
                      <div className="avatarForge__detailBlock">
                        <span className="avatarForge__detailLabel">
                          Skill bonuses
                        </span>
                        <ul>
                          {getClassBonuses(
                            activeClass.id,
                            selectedId === activeClass.id
                              ? selectedSubclassId
                              : null,
                          ).map((bonus) => (
                            <li key={bonus}>{bonus}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="avatarForge__detailBlock">
                        <span className="avatarForge__detailLabel">
                          Lineage
                        </span>
                        <ul>
                          <li>{lineageLabel}</li>
                        </ul>
                      </div>
                      {selectedId === activeClass.id &&
                      classHasSubclasses(activeClass.id) ? (
                        <div className="avatarForge__detailBlock">
                          <span className="avatarForge__detailLabel">
                            Specialization
                          </span>
                          <div className="avatarForge__subclassPicker">
                            {subclassOptions.map((subclass) => {
                              const isSubclassSelected =
                                selectedSubclassId === subclass.id;
                              return (
                                <button
                                  key={subclass.id}
                                  type="button"
                                  className={`avatarForge__subclassBtn${isSubclassSelected ? " avatarForge__subclassBtn--selected" : ""}`}
                                  onClick={() =>
                                    handleSelectSubclass(subclass.id)
                                  }
                                >
                                  <span className="avatarForge__subclassName">
                                    {subclass.name}
                                  </span>
                                  <span className="avatarForge__subclassTag">
                                    {subclass.tagline}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {activeSubclass ? (
                            <p className="avatarForge__subclassDesc">
                              {activeSubclass.description}
                            </p>
                          ) : (
                            <p className="avatarForge__detailEmpty">
                              Choose a mage specialization to continue.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="avatarForge__detailEmpty">
                      Hover a class to view skill bonuses and role details.
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
                CHANGE IDENTITY
              </button>

              <button
                type="button"
                className="avatarForge__continue"
                disabled={!canContinue}
                onClick={handleContinue}
              >
                <span className="avatarForge__continueCursor">▶</span>
                CONFIRM CLASS
              </button>
            </div>
          </div>
        </div>
      </main>
    </AvatarForgeShell>
  );
}
