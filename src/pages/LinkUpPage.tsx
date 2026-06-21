import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MysteryManHaze from "../components/MysteryManHaze";
import { useAuth } from "../hooks/useAuth";
import { clearPendingLinkUp } from "../lib/app-url";
import { getPostLinkUpPath, goToAppPath } from "../lib/avatar-forge-config";
import { enablePersonalAiHud } from "../lib/avatar-forge-hud";
import "./LinkUpPage.css";

type OnboardingScene = "awakening" | "contact";

type ContactStep = "dialogue" | "actions" | "pound";

type TankAction = {
  id: string;
  text: string;
  available: boolean;
};

type AwakeningChoice = {
  id: string;
  text: string;
};

type LightMood = "dark" | "bright" | "unstable" | "pressure" | "clear";

type AwakeningBeat = {
  text: string;
  mood: LightMood;
  lidOpen: number;
};

const AWAKENING_BEATS: AwakeningBeat[] = [
  { text: "Darkness....", mood: "dark", lidOpen: 44 },
  {
    text: "Then light — too bright, smeared at the edges.",
    mood: "bright",
    lidOpen: 40,
  },
  { text: "Your vision won't hold steady.", mood: "unstable", lidOpen: 36 },
  {
    text: "A pressure builds behind your eyes, like surfacing from deep water.",
    mood: "pressure",
    lidOpen: 32,
  },
  {
    text: "One thought breaks through before anything else:",
    mood: "clear",
    lidOpen: 26,
  },
];

const AWAKENING_CHOICES: AwakeningChoice[] = [
  {
    id: "what-happened",
    text: "...What happened? I was here. I was breathing. Why does everything feel wrong?",
  },
  {
    id: "no-body",
    text: "I can't move. I can't feel my hands. Where is my body?",
  },
  {
    id: "who-there",
    text: "Someone's there. I hear you. Don't leave me in the dark....Please?",
  },
];

type ContactBeat = {
  text: string;
  speaker: "mystery" | "player";
};

type CompletedContactLine = ContactBeat;

type ContactScriptEntry =
  | { kind: "line"; beat: ContactBeat; holdMs?: number }
  | { kind: "blink" };

const EXPLANATION_LINE =
  "Please, do not be alarmed. Your body died, but we managed to preserve your mind. You are now in one of the avatars we have ready for you to create to your choosing.";

const CONTACT_SCRIPTS: Record<string, ContactScriptEntry[]> = {
  "what-happened": [
    {
      kind: "line",
      beat: {
        speaker: "mystery",
        text: "No, no don't try to talk just yet. Please calm down.",
      },
    },
    { kind: "blink" },
    {
      kind: "line",
      beat: {
        speaker: "player",
        text: "You seem to be trapped in some sort of....liquid.",
      },
    },
    { kind: "blink" },
    {
      kind: "line",
      beat: { speaker: "mystery", text: EXPLANATION_LINE },
    },
  ],
  "no-body": [
    {
      kind: "line",
      beat: { speaker: "mystery", text: "You're awake!" },
      holdMs: 1700,
    },
    {
      kind: "line",
      beat: {
        speaker: "mystery",
        text: "Please calm down, I promise I will explain everything.",
      },
    },
    { kind: "blink" },
    {
      kind: "line",
      beat: { speaker: "mystery", text: EXPLANATION_LINE },
    },
  ],
  "who-there": [
    {
      kind: "line",
      beat: {
        speaker: "mystery",
        text: "Awakening in progress. Hold steady.",
      },
    },
    { kind: "blink" },
    {
      kind: "line",
      beat: {
        speaker: "player",
        text: "...So I wasn't wrong. Someone is here.",
      },
    },
    { kind: "blink" },
    {
      kind: "line",
      beat: { speaker: "mystery", text: EXPLANATION_LINE },
    },
  ],
};

function getContactScript(choiceId: string | null): ContactScriptEntry[] {
  if (choiceId && CONTACT_SCRIPTS[choiceId]) {
    return CONTACT_SCRIPTS[choiceId];
  }
  return CONTACT_SCRIPTS["what-happened"];
}

const TANK_ACTIONS: TankAction[] = [
  { id: "pound-glass", text: "Try to pound on the glass", available: true },
  { id: "speak-again", text: "Try to speak again", available: false },
  { id: "look-around", text: "Try to look around", available: false },
];

const POUND_SCRIPT: ContactScriptEntry[] = [
  {
    kind: "line",
    beat: {
      speaker: "mystery",
      text: "Hey—stop. Please, calm down. You're going to hurt yourself.",
    },
    holdMs: 1100,
  },
  {
    kind: "line",
    beat: {
      speaker: "mystery",
      text: "I know none of this makes sense yet. You can't breathe in there—just focus on my voice.",
    },
    holdMs: 1000,
  },
  {
    kind: "line",
    beat: {
      speaker: "mystery",
      text: "Let me show you. Your personal interface is coming online now.",
    },
    holdMs: 1300,
  },
];

const CONTACT_CHAR_MS = 32;
const CONTACT_LINE_HOLD_MS = 850;
const CONTACT_BLINK_CLOSED_MS = 360;
const CONTACT_BLINK_OPEN_MS = 900;
const STRUGGLE_DURATION_MS = 3200;

const BEAT_CHAR_MS = 36;
const BEAT_HOLD_MS = 1300;
const BLINK_CLOSED_MS = 340;
const FIRST_CLOSED_MS = 900;
const LID_OPEN_MS = 520;
const CONTACT_REVEAL_HOLD_MS = 1800;

async function waitMs(
  ms: number,
  isCancelled: () => boolean,
  isPaused: () => boolean,
) {
  let remaining = ms;
  while (remaining > 0) {
    if (isCancelled()) return;
    if (isPaused()) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 100);
      });
      continue;
    }
    const step = Math.min(40, remaining);
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, step);
    });
    remaining -= step;
  }
}

function ContactSpeakerLabel({ speaker }: { speaker: ContactBeat["speaker"] }) {
  if (speaker === "player") {
    return <span className="linkUp__contactLabel">YOU</span>;
  }

  return (
    <span className="linkUp__contactLabel linkUp__contactLabel--mystery">???</span>
  );
}

export default function LinkUpPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const awakeningRunRef = useRef(0);
  const contactRunRef = useRef(0);
  const contactDialogueRunRef = useRef(0);
  const poundDialogueRunRef = useRef(0);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [scene, setScene] = useState<OnboardingScene>("awakening");
  const [awakeningStep, setAwakeningStep] = useState<
    "beats" | "choices" | "selected"
  >("beats");
  const [lidOpenPct, setLidOpenPct] = useState(50);
  const [eyesOpen, setEyesOpen] = useState(false);
  const [beatMood, setBeatMood] = useState<LightMood>("dark");
  const [beatText, setBeatText] = useState("");
  const [beatTyping, setBeatTyping] = useState(false);
  const [memoryFragments, setMemoryFragments] = useState<string[]>([]);
  const [playerResponse, setPlayerResponse] = useState<string | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [contactEyesOpen, setContactEyesOpen] = useState(false);
  const [contactLidOpenPct, setContactLidOpenPct] = useState(50);
  const [contactFigureVisible, setContactFigureVisible] = useState(false);
  const [contactDialogueReady, setContactDialogueReady] = useState(false);
  const [completedContactLines, setCompletedContactLines] = useState<
    CompletedContactLine[]
  >([]);
  const [contactActiveLine, setContactActiveLine] = useState("");
  const [contactActiveSpeaker, setContactActiveSpeaker] = useState<
    "mystery" | "player" | null
  >(null);
  const [contactCharIndex, setContactCharIndex] = useState(0);
  const [showContactContinue, setShowContactContinue] = useState(false);
  const [contactStep, setContactStep] = useState<ContactStep>("dialogue");
  const [contactTransitioning, setContactTransitioning] = useState(false);
  const [glassHitActive, setGlassHitActive] = useState(false);
  const [struggleActive, setStruggleActive] = useState(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (scene !== "awakening" || awakeningStep !== "beats") return;

    const runId = awakeningRunRef.current + 1;
    awakeningRunRef.current = runId;
    let cancelled = false;
    const isCancelled = () =>
      cancelled || awakeningRunRef.current !== runId;
    const isPaused = () => pausedRef.current;

    async function blinkClosed(duration: number) {
      setEyesOpen(false);
      setLidOpenPct(50);
      setBeatMood("dark");
      setBeatText("");
      setBeatTyping(false);
      await waitMs(duration, isCancelled, isPaused);
    }

    async function blinkOpen(beat: AwakeningBeat) {
      setEyesOpen(true);
      setBeatMood(beat.mood);
      setLidOpenPct(beat.lidOpen);
      await waitMs(LID_OPEN_MS, isCancelled, isPaused);
    }

    async function typeBeat(text: string) {
      setBeatTyping(true);
      for (let index = 0; index <= text.length; index += 1) {
        if (isCancelled()) return;
        setBeatText(text.slice(0, index));
        await waitMs(BEAT_CHAR_MS, isCancelled, isPaused);
      }
      setBeatTyping(false);
      await waitMs(BEAT_HOLD_MS, isCancelled, isPaused);
    }

    async function runBeats() {
      for (let index = 0; index < AWAKENING_BEATS.length; index += 1) {
        if (isCancelled()) return;

        const beat = AWAKENING_BEATS[index];
        await blinkClosed(index === 0 ? FIRST_CLOSED_MS : BLINK_CLOSED_MS);
        if (isCancelled()) return;

        await blinkOpen(beat);
        if (isCancelled()) return;

        await typeBeat(beat.text);
        if (isCancelled()) return;
      }

      setMemoryFragments(AWAKENING_BEATS.map((beat) => beat.text));
      await blinkClosed(BLINK_CLOSED_MS);
      if (isCancelled()) return;

      setAwakeningStep("choices");
      setEyesOpen(true);
      setLidOpenPct(5);
      setBeatMood("clear");
      setBeatText("");
    }

    runBeats();

    return () => {
      cancelled = true;
    };
  }, [scene, awakeningStep]);

  useEffect(() => {
    if (awakeningStep !== "selected" || !selectedChoiceId) return;

    const runId = contactRunRef.current + 1;
    contactRunRef.current = runId;
    let cancelled = false;
    const isCancelled = () => cancelled || contactRunRef.current !== runId;
    const isPaused = () => pausedRef.current;

    async function runContactReveal() {
      setEyesOpen(true);
      setLidOpenPct(6);
      await waitMs(800, isCancelled, isPaused);
      if (isCancelled()) return;

      setEyesOpen(false);
      setLidOpenPct(50);
      await waitMs(360, isCancelled, isPaused);
      if (isCancelled()) return;

      setScene("contact");
      setContactEyesOpen(false);
      setContactLidOpenPct(50);
      setContactFigureVisible(false);
      setContactDialogueReady(false);
      setCompletedContactLines([]);
      setContactActiveLine("");
      setContactActiveSpeaker(null);
      setContactCharIndex(0);
      setShowContactContinue(false);
      setContactStep("dialogue");
      setContactTransitioning(false);
      setGlassHitActive(false);
      setStruggleActive(false);
      await waitMs(480, isCancelled, isPaused);
      if (isCancelled()) return;

      if (selectedChoiceId === "no-body") {
        setContactEyesOpen(true);
        setContactLidOpenPct(3);
        setStruggleActive(true);
        await waitMs(STRUGGLE_DURATION_MS, isCancelled, isPaused);
        if (isCancelled()) return;

        setStruggleActive(false);
        setContactEyesOpen(false);
        setContactLidOpenPct(50);
        await waitMs(CONTACT_BLINK_CLOSED_MS, isCancelled, isPaused);
        if (isCancelled()) return;

        setContactEyesOpen(true);
        setContactLidOpenPct(3);
        await waitMs(CONTACT_BLINK_OPEN_MS, isCancelled, isPaused);
        if (isCancelled()) return;

        setContactFigureVisible(true);
        await waitMs(CONTACT_REVEAL_HOLD_MS, isCancelled, isPaused);
        if (isCancelled()) return;

        setContactDialogueReady(true);
        return;
      }

      setContactEyesOpen(true);
      setContactLidOpenPct(3);
      await waitMs(900, isCancelled, isPaused);
      if (isCancelled()) return;

      setContactFigureVisible(true);
      await waitMs(CONTACT_REVEAL_HOLD_MS, isCancelled, isPaused);
      if (isCancelled()) return;

      setContactDialogueReady(true);
    }

    runContactReveal();

    return () => {
      cancelled = true;
    };
  }, [awakeningStep, selectedChoiceId]);

  useEffect(() => {
    if (scene !== "contact" || !contactDialogueReady) return;

    const runId = contactDialogueRunRef.current + 1;
    contactDialogueRunRef.current = runId;
    let cancelled = false;
    const isCancelled = () =>
      cancelled || contactDialogueRunRef.current !== runId;
    const isPaused = () => pausedRef.current;

    async function contactBlink() {
      setContactEyesOpen(false);
      setContactLidOpenPct(50);
      await waitMs(CONTACT_BLINK_CLOSED_MS, isCancelled, isPaused);
      if (isCancelled()) return;

      setContactEyesOpen(true);
      setContactLidOpenPct(3);
      await waitMs(CONTACT_BLINK_OPEN_MS, isCancelled, isPaused);
    }

    async function typeContactLine(beat: ContactBeat, holdMs = CONTACT_LINE_HOLD_MS) {
      setContactActiveLine(beat.text);
      setContactActiveSpeaker(beat.speaker);
      setContactCharIndex(0);

      for (let index = 0; index <= beat.text.length; index += 1) {
        if (isCancelled()) return;
        setContactCharIndex(index);
        await waitMs(CONTACT_CHAR_MS, isCancelled, isPaused);
      }

      setCompletedContactLines((lines) => [...lines, beat]);
      setContactActiveLine("");
      setContactActiveSpeaker(null);
      setContactCharIndex(0);
      await waitMs(holdMs, isCancelled, isPaused);
    }

    async function runContactDialogue() {
      setShowContactContinue(false);
      const script = getContactScript(selectedChoiceId);

      for (const entry of script) {
        if (isCancelled()) return;

        if (entry.kind === "line") {
          await typeContactLine(entry.beat, entry.holdMs);
          if (isCancelled()) return;
          continue;
        }

        if (entry.kind === "blink") {
          await contactBlink();
        }
      }

      if (isCancelled()) return;
      setShowContactContinue(true);
    }

    runContactDialogue();

    return () => {
      cancelled = true;
    };
  }, [scene, contactDialogueReady, selectedChoiceId]);

  useEffect(() => {
    if (scene !== "contact" || contactStep !== "pound") return;

    const runId = poundDialogueRunRef.current + 1;
    poundDialogueRunRef.current = runId;
    let cancelled = false;
    const isCancelled = () =>
      cancelled || poundDialogueRunRef.current !== runId;
    const isPaused = () => pausedRef.current;

    async function contactBlink() {
      setContactEyesOpen(false);
      setContactLidOpenPct(50);
      await waitMs(CONTACT_BLINK_CLOSED_MS, isCancelled, isPaused);
      if (isCancelled()) return;

      setContactEyesOpen(true);
      setContactLidOpenPct(3);
      await waitMs(CONTACT_BLINK_OPEN_MS, isCancelled, isPaused);
    }

    async function typeContactLine(beat: ContactBeat, holdMs = CONTACT_LINE_HOLD_MS) {
      setContactActiveLine(beat.text);
      setContactActiveSpeaker(beat.speaker);
      setContactCharIndex(0);

      for (let index = 0; index <= beat.text.length; index += 1) {
        if (isCancelled()) return;
        setContactCharIndex(index);
        await waitMs(CONTACT_CHAR_MS, isCancelled, isPaused);
      }

      setCompletedContactLines((lines) => [...lines, beat]);
      setContactActiveLine("");
      setContactActiveSpeaker(null);
      setContactCharIndex(0);
      await waitMs(holdMs, isCancelled, isPaused);
    }

    async function runPoundDialogue() {
      setCompletedContactLines([]);
      setContactActiveLine("");
      setContactActiveSpeaker(null);
      setContactCharIndex(0);
      await waitMs(520, isCancelled, isPaused);

      for (const entry of POUND_SCRIPT) {
        if (isCancelled()) return;

        if (entry.kind === "line") {
          await typeContactLine(entry.beat, entry.holdMs);
          if (isCancelled()) return;
          continue;
        }

        if (entry.kind === "blink") {
          await contactBlink();
        }
      }

      if (isCancelled()) return;

      await contactBlink();
      if (isCancelled()) return;

      await waitMs(700, isCancelled, isPaused);
      if (isCancelled()) return;

      enablePersonalAiHud();
      clearPendingLinkUp();
      goToAppPath(getPostLinkUpPath(), navigate);
    }

    runPoundDialogue();

    return () => {
      cancelled = true;
    };
  }, [scene, contactStep, navigate]);

  function handleAwakeningChoice(choice: AwakeningChoice) {
    setPlayerResponse(choice.text);
    setSelectedChoiceId(choice.id);
    setAwakeningStep("selected");
    setEyesOpen(true);
    setLidOpenPct(6);
    setBeatMood("clear");
  }

  async function transitionToTankActions() {
    setContactEyesOpen(false);
    setContactLidOpenPct(50);
    await waitMs(CONTACT_BLINK_CLOSED_MS, () => false, () => pausedRef.current);

    setContactStep("actions");
    setCompletedContactLines([]);
    setContactActiveLine("");
    setContactActiveSpeaker(null);
    setShowContactContinue(false);

    setContactEyesOpen(true);
    setContactLidOpenPct(3);
    await waitMs(CONTACT_BLINK_OPEN_MS, () => false, () => pausedRef.current);
  }

  async function handleContactContinue() {
    if (contactTransitioning) return;

    setContactTransitioning(true);
    await transitionToTankActions();
    setContactTransitioning(false);
  }

  async function handleTankAction(action: TankAction) {
    if (!action.available || contactTransitioning) return;

    if (action.id === "pound-glass") {
      setContactTransitioning(true);
      setContactEyesOpen(false);
      setContactLidOpenPct(50);
      await waitMs(CONTACT_BLINK_CLOSED_MS, () => false, () => pausedRef.current);

      setCompletedContactLines([]);
      setContactActiveLine("");
      setContactActiveSpeaker(null);
      setContactCharIndex(0);
      setContactEyesOpen(true);
      setContactLidOpenPct(3);
      setGlassHitActive(true);
      await waitMs(CONTACT_BLINK_OPEN_MS, () => false, () => pausedRef.current);
      await waitMs(700, () => false, () => pausedRef.current);

      setGlassHitActive(false);
      setContactStep("pound");
      setContactTransitioning(false);
    }
  }

  const username =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "UNKNOWN";

  const isAwakening = scene === "awakening";
  const isContact = scene === "contact";
  const showContactDialogue = contactStep === "dialogue" && contactDialogueReady;
  const showPoundDialogue = contactStep === "pound";
  const showOverlayDialogue = showContactDialogue || showPoundDialogue;
  const showTankActions = contactStep === "actions";
  const showPoundReaction = contactStep === "pound" || glassHitActive;
  const tankActionsOverlay = showTankActions ? (
    <div className="linkUp__tankActions">
      <p className="linkUp__tankActionsPrompt">What do you try?</p>
      <div className="linkUp__choices linkUp__choices--tank">
        {TANK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`linkUp__choice${
              action.available ? "" : " linkUp__choice--disabled"
            }`}
            disabled={!action.available || contactTransitioning}
            onClick={() => void handleTankAction(action)}
          >
            <span className="linkUp__choiceMarker">▸</span>
            <span className="linkUp__choiceText">{action.text}</span>
          </button>
        ))}
      </div>
    </div>
  ) : null;
  const contactStatus = glassHitActive
    ? "IMPACT"
    : contactStep === "pound"
      ? "CALMING"
      : struggleActive
        ? "STRUGGLING"
        : showTankActions
          ? "IMMOBILE"
          : "SUBMERGED";
  const promptText = AWAKENING_BEATS[AWAKENING_BEATS.length - 1]?.text ?? "";
  const povClassName = [
    "linkUp__pov",
    eyesOpen ? "linkUp__pov--eyes-open" : "linkUp__pov--eyes-closed",
    `linkUp__pov--mood-${beatMood}`,
    awakeningStep === "choices" ? "linkUp__pov--choices" : "",
    awakeningStep === "selected" ? "linkUp__pov--selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`linkUp${isAwakening ? " linkUp--awakening" : ""}${
        isContact ? " linkUp--contact" : ""
      }${paused ? " linkUp--paused" : ""}${
        glassHitActive ? " linkUp--glass-hit" : ""
      }`}
    >
      <div className="linkUp__bg" />
      <div className="linkUp__scanlines" />
      <div className="linkUp__vignette" />

      {isAwakening ? (
        <>
          <div className="linkUp__frame linkUp__frame--tl" />
          <div className="linkUp__frame linkUp__frame--tr" />
          <div className="linkUp__frame linkUp__frame--bl" />
          <div className="linkUp__frame linkUp__frame--br" />
        </>
      ) : null}

      <div className="linkUp__hud linkUp__hud--tl">
        <span>MODULE</span>
        <span className="linkUp__hudVal">
          {isContact
            ? showTankActions || contactStep === "pound"
              ? "CONTAINMENT"
              : "CONTACT"
            : "CONSCIOUSNESS"}
        </span>
      </div>
      <div className="linkUp__hud linkUp__hud--tr">
        <span>OPERATOR</span>
        <span className="linkUp__hudVal linkUp__hudVal--accent">
          {username.toUpperCase()}
        </span>
      </div>
      <div className="linkUp__hud linkUp__hud--bl">
        <span>STATUS</span>
        <span className="linkUp__hudVal linkUp__hudVal--live">
          {paused ? "PAUSED" : isContact ? contactStatus : "DISORIENTED"}
        </span>
      </div>

      <button
        type="button"
        className="linkUp__pauseBtn"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={paused ? "Resume onboarding" : "Pause onboarding"}
      >
        {paused ? "▶ RESUME" : "❚❚ PAUSE"}
      </button>

      <main
        className={`linkUp__main${
          isContact ? " linkUp__main--contact" : ""
        }`}
      >
        {isAwakening ? (
          <div className="linkUp__header">
            <p className="linkUp__eyebrow">SIGNAL UNKNOWN</p>
            <h1 className="linkUp__title">AWAKENING</h1>
            <p className="linkUp__subtitle">
              Blink open — your first thought awaits
            </p>
          </div>
        ) : null}

        {isAwakening ? (
          <div className="linkUp__awakening">
            <div
              className={povClassName}
              style={{ "--lid-height": `${lidOpenPct}%` } as React.CSSProperties}
              role="region"
              aria-label="First-person awakening view"
            >
              <div className="linkUp__povAtmosphere" aria-hidden>
                <div className="linkUp__povBlur" />
                <div className="linkUp__povLight" />
                <div className="linkUp__povWash" />
                <div className="linkUp__povPulse" />
              </div>

              <div
                className={`linkUp__povContent${
                  eyesOpen ? " linkUp__povContent--visible" : ""
                }`}
              >
                {awakeningStep === "beats" && beatText ? (
                  <p className="linkUp__povThought">
                    {beatText}
                    {beatTyping && !paused ? (
                      <span className="linkUp__cursor">|</span>
                    ) : null}
                  </p>
                ) : null}

                {awakeningStep === "choices" ? (
                  <div className="linkUp__povReveal">
                    <div className="linkUp__povMemory">
                      {memoryFragments.slice(0, -1).map((fragment) => (
                        <p key={fragment} className="linkUp__povMemoryLine">
                          {fragment}
                        </p>
                      ))}
                    </div>
                    <p className="linkUp__povPrompt">{promptText}</p>
                    <div className="linkUp__choices">
                      {AWAKENING_CHOICES.map((choice) => (
                        <button
                          key={choice.id}
                          type="button"
                          className="linkUp__choice"
                          onClick={() => handleAwakeningChoice(choice)}
                        >
                          <span className="linkUp__choiceMarker">▸</span>
                          <span className="linkUp__choiceText">{choice.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {awakeningStep === "selected" && playerResponse ? (
                  <div className="linkUp__povReveal">
                    <p className="linkUp__povThought linkUp__povThought--player">
                      <span className="linkUp__povThoughtLabel">YOU</span>
                      {playerResponse}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="linkUp__povLid linkUp__povLid--top" aria-hidden />
              <div
                className="linkUp__povLid linkUp__povLid--bottom"
                aria-hidden
              />
            </div>
          </div>
        ) : (
          <div
            className={`linkUp__contactStage${
              showPoundReaction ? " linkUp__contactStage--pound" : ""
            }`}
          >
            <MysteryManHaze
              eyesOpen={contactEyesOpen}
              lidOpenPct={contactLidOpenPct}
              struggling={struggleActive}
              figureVisible={
                !struggleActive &&
                (contactFigureVisible || contactStep !== "dialogue")
              }
            >
              {showOverlayDialogue ? (
                <>
                  {showContactDialogue &&
                  playerResponse &&
                  selectedChoiceId !== "who-there" ? (
                    <p className="linkUp__contactLine linkUp__contactLine--player">
                      <span className="linkUp__contactLabel">YOU</span>
                      {playerResponse}
                    </p>
                  ) : null}

                  {completedContactLines.map((line, index) => (
                    <p
                      key={`contact-done-${index}`}
                      className={`linkUp__contactLine linkUp__contactLine--done${
                        line.speaker === "player"
                          ? " linkUp__contactLine--player"
                          : ""
                      }`}
                    >
                      <ContactSpeakerLabel speaker={line.speaker} />
                      {line.text}
                    </p>
                  ))}

                  {contactActiveLine ? (
                    <p
                      className={`linkUp__contactLine linkUp__contactLine--active${
                        contactActiveSpeaker === "player"
                          ? " linkUp__contactLine--player"
                          : ""
                      }`}
                    >
                      {contactActiveSpeaker ? (
                        <ContactSpeakerLabel speaker={contactActiveSpeaker} />
                      ) : null}
                      {contactActiveLine.slice(0, contactCharIndex)}
                      {!paused ? <span className="linkUp__cursor">|</span> : null}
                    </p>
                  ) : null}

                  {showContactContinue ? (
                    <button
                      type="button"
                      className="linkUp__continue linkUp__continue--contact"
                      onClick={() => void handleContactContinue()}
                    >
                      <span className="linkUp__continueCursor">▶</span>
                      CONTINUE
                    </button>
                  ) : null}
                </>
              ) : null}

              {tankActionsOverlay}
            </MysteryManHaze>
          </div>
        )}

        {isAwakening ? (
          <p className="linkUp__warning">
            Sensory feed unstable. Memory fragments may be incomplete.
          </p>
        ) : null}
      </main>
    </div>
  );
}
