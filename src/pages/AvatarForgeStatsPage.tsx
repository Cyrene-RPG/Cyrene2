import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CharacterSheetReadout from "../components/CharacterSheetReadout";
import UnknownFigure from "../components/UnknownFigure";
import {
  AvatarForgePageHeader,
  AvatarForgePanelHeader,
  AvatarForgeShell,
  useAvatarForgeHud,
} from "../components/AvatarForgeShell";
import DiceRoller3D, { getDiceDroppedIndex } from "../components/DiceRoller3D";
import { classHasSubclasses, formatClassLabel } from "../data/classes";
import { getSpeciesById } from "../data/species";
import { getSubspeciesById } from "../data/subspecies";
import { useAuth } from "../hooks/useAuth";
import { useAvatarDraft } from "../hooks/useAvatarDraft";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import { clearPersonalAiHud } from "../lib/avatar-forge-hud";
import {
  clearAvatarDraft,
  formatCharacterName,
  formatGenderLabel,
  formatHeight,
  loadAvatarDraft,
  saveAvatarDraft,
  syncStatDiceRolls,
  validateIdentity,
} from "../lib/avatar-draft";
import { saveOperatorAvatar, getAvatarDisplayName, getAvatarIdentificationNumber, resolveIdentificationForDraft } from "../lib/operator-avatars";
import {
  ABILITIES,
  ABILITY_LABELS,
  applyAbilityModifiers,
  clampPreRacialScores,
  createEmptyAbilityScores,
  formatAbilityRoll,
  formatOperatorIdentificationNumber,
  getSpeciesAbilityModifiers,
  HUMAN_BONUS_POINTS,
  REROLLS_PER_ABILITY,
  rollAbilityScore,
  speciesUsesBonusPoints,
  trimStatDiceRollsFromIndex,
  omitStatDiceRoll,
  type Ability,
  type AbilityRollResult,
  type AbilityScores,
} from "../lib/avatar-stats";
import "./AvatarForgePage.css";

const TUTORIAL_MESSAGE =
  "Roll your core abilities — four dice, keep the highest three. Your first roll is free; you may reroll once if you want. Rolled scores cap at 16 before species bonuses apply.";

type ForgePhase = "rolling" | "human-bonus" | "finalize";

function isClassStepComplete(draft: ReturnType<typeof loadAvatarDraft>) {
  if (!draft.classId) return false;
  if (classHasSubclasses(draft.classId) && !draft.subclassId) return false;
  return true;
}

export default function AvatarForgeStatsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const draft = useAvatarDraft();

  const [charIndex, setCharIndex] = useState(0);
  const [messageDone, setMessageDone] = useState(false);
  const [phase, setPhase] = useState<ForgePhase>("rolling");
  const [abilityIndex, setAbilityIndex] = useState(0);
  const [rerollsLeft, setRerollsLeft] = useState(REROLLS_PER_ABILITY);
  const [currentRoll, setCurrentRoll] = useState<AbilityRollResult | null>(null);
  const [rolledStats, setRolledStats] = useState<Partial<AbilityScores>>({});
  const [workingStats, setWorkingStats] = useState<AbilityScores>(
    createEmptyAbilityScores(),
  );
  const [humanRolledBase, setHumanRolledBase] = useState<AbilityScores>(
    createEmptyAbilityScores(),
  );
  const [bonusPointsLeft, setBonusPointsLeft] = useState(HUMAN_BONUS_POINTS);
  const [finalStats, setFinalStats] = useState<AbilityScores | null>(null);
  const [rollTrigger, setRollTrigger] = useState(0);
  const [diceResetKey, setDiceResetKey] = useState(0);
  const [diceRolling, setDiceRolling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const currentRollRef = useRef(currentRoll);

  useEffect(() => {
    currentRollRef.current = currentRoll;
  }, [currentRoll]);

  const displayedMessage = TUTORIAL_MESSAGE.slice(0, charIndex);
  const isTyping = charIndex < TUTORIAL_MESSAGE.length;
  const currentAbility = ABILITIES[abilityIndex];

  const speciesModifiers = useMemo(
    () => getSpeciesAbilityModifiers(draft.speciesId, draft.subspeciesId),
    [draft.speciesId, draft.subspeciesId],
  );

  const parentSpecies = draft.speciesId
    ? getSpeciesById(draft.speciesId)
    : undefined;
  const parentSubspecies = draft.subspeciesId
    ? getSubspeciesById(draft.subspeciesId)
    : undefined;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const current = loadAvatarDraft();
    if (!current.speciesId || !validateIdentity(current).valid) {
      navigate("/avatar-forge/identity", { replace: true });
      return;
    }
    if (!isClassStepComplete(current)) {
      navigate("/avatar-forge/class", { replace: true });
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

  useEffect(() => {
    if (phase !== "finalize" || !user) return;

    let cancelled = false;

    resolveIdentificationForDraft(loadAvatarDraft())
      .then((resolved) => {
        if (cancelled || !resolved) return;
        saveAvatarDraft({ resolvedIdentificationNumber: resolved });
      })
      .catch(() => {
        // Preview resolution is best-effort; save will retry.
      });

    return () => {
      cancelled = true;
    };
  }, [phase, user]);

  function handleRoll() {
    if (phase !== "rolling") return;

    const isReroll = currentRoll != null;
    if (isReroll && rerollsLeft <= 0) return;

    const result = rollAbilityScore();
    setCurrentRoll(result);
    setRollTrigger((count) => count + 1);
    setDiceRolling(true);
    if (isReroll) {
      setRerollsLeft((count) => count - 1);
      setRolledStats((stats) => {
        const next = { ...stats };
        delete next[currentAbility];
        return next;
      });
      syncStatDiceRolls(
        omitStatDiceRoll(loadAvatarDraft().statDiceRolls, currentAbility),
      );
    }
  }

  function handleRollSettled({
    rollId,
    total,
  }: {
    rollId: number;
    total: number;
  }) {
    if (rollId !== rollTrigger || phase !== "rolling") return;

    setDiceRolling(false);
    setRolledStats((stats) => ({
      ...stats,
      [currentAbility]: total,
    }));

    const kept = currentRollRef.current?.kept;
    if (kept?.length) {
      syncStatDiceRolls({
        ...loadAvatarDraft().statDiceRolls,
        [currentAbility]: kept,
      });
    }
  }

  function handleNextAbility() {
    if (phase !== "rolling" || rolledStats[currentAbility] == null) return;

    const nextIndex = abilityIndex + 1;
    if (nextIndex >= ABILITIES.length) {
      const base = ABILITIES.reduce((scores, ability) => {
        scores[ability] = rolledStats[ability] ?? 0;
        return scores;
      }, createEmptyAbilityScores());

      if (speciesUsesBonusPoints(draft.speciesId)) {
        const capped = clampPreRacialScores(base);
        setHumanRolledBase(capped);
        setWorkingStats(capped);
        setBonusPointsLeft(HUMAN_BONUS_POINTS);
        setPhase("human-bonus");
        return;
      }

      const completed = applyAbilityModifiers(base, speciesModifiers);
      setFinalStats(completed);
      setPhase("finalize");
      return;
    }

    setAbilityIndex(nextIndex);
    setRerollsLeft(REROLLS_PER_ABILITY);
    setCurrentRoll(null);
    setDiceRolling(false);
    setDiceResetKey((key) => key + 1);
  }

  function adjustHumanBonus(ability: Ability, delta: 1 | -1) {
    if (phase !== "human-bonus") return;
    if (delta === 1 && bonusPointsLeft <= 0) return;
    if (delta === -1 && workingStats[ability] <= humanRolledBase[ability]) return;

    setWorkingStats((stats) => ({
      ...stats,
      [ability]: stats[ability] + delta,
    }));
    setBonusPointsLeft((points) => points - delta);
  }

  function resetRollingPhase() {
    setPhase("rolling");
    setAbilityIndex(0);
    setRerollsLeft(REROLLS_PER_ABILITY);
    setCurrentRoll(null);
    setRolledStats({});
    setFinalStats(null);
    setBonusPointsLeft(HUMAN_BONUS_POINTS);
    setRollTrigger(0);
    setDiceRolling(false);
    setDiceResetKey((key) => key + 1);
    syncStatDiceRolls(undefined);
  }

  function handleBack() {
    if (phase === "human-bonus" || phase === "finalize") {
      resetRollingPhase();
      return;
    }

    if (abilityIndex > 0) {
      setAbilityIndex((index) => index - 1);
      setRerollsLeft(REROLLS_PER_ABILITY);
      setCurrentRoll(null);
      setDiceRolling(false);
      setDiceResetKey((key) => key + 1);
      setRolledStats((stats) => {
        const next = { ...stats };
        delete next[ABILITIES[abilityIndex]];
        return next;
      });
      syncStatDiceRolls(
        trimStatDiceRollsFromIndex(
          loadAvatarDraft().statDiceRolls,
          abilityIndex,
        ),
      );
      return;
    }

    syncStatDiceRolls(undefined);
    navigate("/avatar-forge/class");
  }

  function handleHumanBonusContinue() {
    if (phase !== "human-bonus" || bonusPointsLeft !== 0) return;
    setFinalStats(workingStats);
    setPhase("finalize");
  }

  async function handleFinish() {
    if (!user || !finalStats || saving) return;

    setSaving(true);
    setSaveError(null);

    try {
      saveAvatarDraft({ stats: finalStats });
      const saved = await saveOperatorAvatar(user.id, loadAvatarDraft());
      clearAvatarDraft();
      clearPersonalAiHud();
      navigate(PROFILE_PATH, {
        replace: true,
        state: {
          savedAvatar: {
            id: saved.id,
            name: getAvatarDisplayName(saved),
            identificationNumber: getAvatarIdentificationNumber(saved),
          },
        },
      });
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save avatar.",
      );
      setSaving(false);
    }
  }

  const username =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "UNKNOWN";

  const characterName = formatCharacterName(draft.displayName, draft.lastName);
  const classLabel = formatClassLabel(draft.classId, draft.subclassId);
  const lineageLabel = parentSubspecies
    ? `${parentSpecies?.name ?? "Species"} / ${parentSubspecies.name}`
    : (parentSpecies?.name ?? "Species");
  const genderLabel = formatGenderLabel(draft.gender, draft.genderOther);
  const heightLabel = formatHeight(draft.heightFt, draft.heightIn);
  const weightLabel =
    draft.weightLb != null ? `${draft.weightLb} lbs` : null;
  const identificationLabel =
    draft.resolvedIdentificationNumber ??
    formatOperatorIdentificationNumber(draft.statDiceRolls).value;

  const canRoll =
    phase === "rolling" &&
    (currentRoll == null || rerollsLeft > 0) &&
    !diceRolling;
  const canAdvance =
    phase === "rolling" &&
    rolledStats[currentAbility] != null &&
    !diceRolling;
  const canFinishHuman = phase === "human-bonus" && bonusPointsLeft === 0;

  const { figureVariant, prompt, panelClass } = useAvatarForgeHud();

  return (
    <AvatarForgeShell
      username={username}
      stepLabel="05 / STATS"
      metaLabel="CLASS"
      metaValue={classLabel.toUpperCase()}
    >
      <main
        className={`avatarForge__main${phase === "finalize" ? " avatarForge__main--finalize" : ""}`}
      >
        <AvatarForgePageHeader
          eyebrow="ABILITY IMPRINT"
          title="AVATAR FORGE"
          subtitle="Roll the six core stats that define your avatar in Cyrene"
          personalEyebrow="ABILITY IMPRINT"
          personalSubtitle="Roll the stats that define your form"
        />

        <div
          className={`avatarForge__stage${phase === "finalize" ? " avatarForge__stage--finalize" : ""}`}
        >
          {phase !== "finalize" ? (
            <div className="avatarForge__figureWrap">
              <UnknownFigure variant={figureVariant} />
            </div>
          ) : null}

          <div
            className={`avatarForge__panel${panelClass}${phase === "finalize" ? " avatarForge__panel--finalize" : ""}`}
          >
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
                {phase === "rolling" && "ROLL ABILITIES"}
                {phase === "human-bonus" && "DISTRIBUTE BONUS POINTS"}
                {phase === "finalize" && "CHARACTER RECORD"}
              </div>

              <div
                className={`avatarForge__workArea avatarForge__workArea--stats${
                  phase === "finalize" ? " avatarForge__workArea--finalize" : ""
                }`}
              >
                {phase === "rolling" ? (
                  <>
                    <div className="avatarForge__statRoll">
                      <p className="avatarForge__statRollLabel">
                        {ABILITY_LABELS[currentAbility]} ({currentAbility})
                      </p>
                      <p className="avatarForge__statRollProgress">
                        STAT {abilityIndex + 1} / {ABILITIES.length}
                      </p>
                      <DiceRoller3D
                        values={currentRoll?.dice ?? null}
                        kept={currentRoll?.kept ?? null}
                        total={currentRoll?.total ?? null}
                        droppedIndex={
                          currentRoll
                            ? getDiceDroppedIndex(currentRoll.dice)
                            : null
                        }
                        rollTrigger={rollTrigger}
                        resetKey={diceResetKey}
                        onRollSettled={handleRollSettled}
                      />
                      <p className="avatarForge__statRollResult">
                        {rolledStats[currentAbility] != null
                          ? formatAbilityRoll(currentRoll)
                          : null}
                        {rolledStats[currentAbility] != null ? (
                          <span className="avatarForge__statRollDropped">
                            {" "}
                            (dropped lowest)
                          </span>
                        ) : null}
                      </p>
                      <p className="avatarForge__statRollMeta">
                        {currentRoll == null
                          ? `${REROLLS_PER_ABILITY} rerolls after first roll`
                          : `Rerolls left: ${rerollsLeft}`}
                      </p>
                      <div className="avatarForge__statRollActions">
                        <button
                          type="button"
                          className="avatarForge__rollBtn"
                          disabled={!canRoll}
                          onClick={handleRoll}
                        >
                          ROLL 4D6
                        </button>
                      </div>
                    </div>

                    <div className="avatarForge__detail avatarForge__detail--readout">
                      <div className="avatarForge__detailName">
                        ROLLED SO FAR
                      </div>
                      <div className="avatarForge__readout">
                        {ABILITIES.map((ability) => (
                          <div
                            key={ability}
                            className="avatarForge__readoutRow"
                          >
                            <span className="avatarForge__readoutKey">
                              {ability}
                            </span>
                            <span className="avatarForge__readoutVal">
                              {rolledStats[ability] ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {phase === "human-bonus" ? (
                  <>
                    <div className="avatarForge__humanBonus">
                      <p className="avatarForge__humanBonusLead">
                        Humans adapt where others are fixed. Distribute{" "}
                        {HUMAN_BONUS_POINTS} bonus points across your rolled
                        stats.
                      </p>
                      <p className="avatarForge__statRollMeta">
                        Points remaining: {bonusPointsLeft}
                      </p>
                      <div className="avatarForge__humanBonusGrid">
                        {ABILITIES.map((ability) => (
                          <div
                            key={ability}
                            className="avatarForge__humanBonusCard"
                          >
                            <span className="avatarForge__humanBonusName">
                              {ability}
                            </span>
                            <span className="avatarForge__humanBonusValue">
                              {workingStats[ability]}
                            </span>
                            <div className="avatarForge__humanBonusActions">
                              <button
                                type="button"
                                className="avatarForge__humanBonusBtn"
                                disabled={workingStats[ability] <= humanRolledBase[ability]}
                                onClick={() => adjustHumanBonus(ability, -1)}
                              >
                                −
                              </button>
                              <button
                                type="button"
                                className="avatarForge__humanBonusBtn"
                                disabled={bonusPointsLeft <= 0}
                                onClick={() => adjustHumanBonus(ability, 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {phase === "finalize" && finalStats ? (
                  <div className="avatarForge__sheetWrap">
                    <CharacterSheetReadout
                      variant="landscape"
                      characterName={characterName}
                        lineageLabel={lineageLabel}
                        classLabel={classLabel}
                        classId={draft.classId}
                        subclassId={draft.subclassId}
                        genderLabel={genderLabel}
                        operatorLabel={username.toUpperCase()}
                        identificationNumber={identificationLabel}
                        stats={finalStats}
                        speciesModifiers={speciesModifiers}
                        age={draft.age}
                        heightLabel={heightLabel !== "—" ? heightLabel : null}
                        weightLabel={weightLabel}
                      />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="avatarForge__actions">
              {saveError ? (
                <p className="avatarForge__saveError">{saveError}</p>
              ) : null}
              <button
                type="button"
                className="avatarForge__backBtn"
                onClick={handleBack}
              >
                <span className="avatarForge__backCursor">◀</span>
                {phase === "rolling" && abilityIndex === 0
                  ? "CHANGE CLASS"
                  : "BACK"}
              </button>

              {phase === "rolling" ? (
                <button
                  type="button"
                  className="avatarForge__continue"
                  disabled={!canAdvance}
                  onClick={handleNextAbility}
                >
                  <span className="avatarForge__continueCursor">▶</span>
                  {abilityIndex >= ABILITIES.length - 1
                    ? "LOCK STATS"
                    : "NEXT STAT"}
                </button>
              ) : null}

              {phase === "human-bonus" ? (
                <button
                  type="button"
                  className="avatarForge__continue"
                  disabled={!canFinishHuman}
                  onClick={handleHumanBonusContinue}
                >
                  <span className="avatarForge__continueCursor">▶</span>
                  LOCK STATS
                </button>
              ) : null}

              {phase === "finalize" ? (
                <button
                  type="button"
                  className="avatarForge__continue"
                  disabled={saving}
                  onClick={handleFinish}
                >
                  <span className="avatarForge__continueCursor">▶</span>
                  {saving ? "SAVING..." : "SAVE TO OPERATOR FILE"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </AvatarForgeShell>
  );
}
