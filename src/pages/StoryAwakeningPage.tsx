import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import SuspensionTankPOV from "../components/SuspensionTankPOV";
import { useAuth } from "../hooks/useAuth";
import {
  AWAKENING_FADE_MS,
  BEAT_CHAR_MS_DEFAULT,
  BEAT_HOLD_MS_DEFAULT,
  BLINK_CLOSED_MS_DEFAULT,
  CONTENT_REVEAL_MS,
  FIRST_CLOSED_MS,
  LID_OPEN_MS_DEFAULT,
  SETTLE_AFTER_OPEN_MS,
  STORY_AWAKENING_BEATS,
  type AwakeningBeat,
  type AwakeningMood,
} from "../data/story-awakening-beats";
import {
  CONTAINMENT_CHAR_MS_DEFAULT,
  CONTAINMENT_FINAL_HOLD_MS,
  CONTAINMENT_HOLD_MS_DEFAULT,
  CONTAINMENT_TRANSITION_MS,
  STORY_CONTAINMENT_BEATS,
  type ContainmentBeat,
  type ContainmentRevealLevel,
} from "../data/story-containment-beats";
import { waitCinematicMs } from "../lib/cinematic-wait";
import "./StoryAwakeningPage.css";

type Phase = "beats" | "containment" | "fade";

function formatThought(text: string) {
  return text.split("\n").map((line, index, lines) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

export default function StoryAwakeningPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const runRef = useRef(0);
  const pausedRef = useRef(false);

  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState<Phase>("beats");
  const [beatIndex, setBeatIndex] = useState(0);
  const [containmentIndex, setContainmentIndex] = useState(0);
  const [revealLevel, setRevealLevel] = useState<ContainmentRevealLevel>(0);
  const [eyesOpen, setEyesOpen] = useState(false);
  const [lidOpenPct, setLidOpenPct] = useState(50);
  const [mood, setMood] = useState<AwakeningMood>("dark");
  const [beatText, setBeatText] = useState("");
  const [beatTyping, setBeatTyping] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [tankVisible, setTankVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const username =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "UNKNOWN";

  const isContainment = phase === "containment";
  const totalBeats =
    STORY_AWAKENING_BEATS.length + STORY_CONTAINMENT_BEATS.length;
  const currentBeatNumber = isContainment
    ? STORY_AWAKENING_BEATS.length + containmentIndex + 1
    : beatIndex + 1;

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (loading || !user) return;

    const runId = runRef.current + 1;
    runRef.current = runId;
    let cancelled = false;
    const isCancelled = () => cancelled || runRef.current !== runId;
    const isPaused = () => pausedRef.current;

    async function blinkClosed(duration: number) {
      setEyesOpen(false);
      setContentVisible(false);
      setLidOpenPct(50);
      setBeatText("");
      setBeatTyping(false);
      await waitCinematicMs(duration, isCancelled, isPaused);
    }

    async function blinkOpen(beat: AwakeningBeat) {
      setEyesOpen(true);
      setMood(beat.mood);
      setLidOpenPct(beat.lidOpen);
      setContentVisible(false);
      await waitCinematicMs(
        beat.lidOpenMs ?? LID_OPEN_MS_DEFAULT,
        isCancelled,
        isPaused,
      );
    }

    async function revealContent(beat: AwakeningBeat) {
      await waitCinematicMs(
        beat.settleMs ?? SETTLE_AFTER_OPEN_MS,
        isCancelled,
        isPaused,
      );
      if (isCancelled()) return;

      setContentVisible(true);
      await waitCinematicMs(CONTENT_REVEAL_MS, isCancelled, isPaused);
    }

    async function typeLines(
      text: string,
      charMs: number,
      holdMs: number,
    ) {
      setBeatTyping(true);
      for (let index = 0; index <= text.length; index += 1) {
        if (isCancelled()) return;
        setBeatText(text.slice(0, index));
        await waitCinematicMs(charMs, isCancelled, isPaused);
      }
      setBeatTyping(false);
      await waitCinematicMs(holdMs, isCancelled, isPaused);
    }

    async function typeAwakeningBeat(beat: AwakeningBeat) {
      await typeLines(
        beat.text,
        beat.charMs ?? BEAT_CHAR_MS_DEFAULT,
        beat.holdMs ?? BEAT_HOLD_MS_DEFAULT,
      );
    }

    async function typeContainmentBeat(beat: ContainmentBeat) {
      setRevealLevel(beat.revealLevel);
      await typeLines(
        beat.text,
        beat.charMs ?? CONTAINMENT_CHAR_MS_DEFAULT,
        beat.holdMs ?? CONTAINMENT_HOLD_MS_DEFAULT,
      );
    }

    async function runSequence() {
      setPhase("beats");

      for (let index = 0; index < STORY_AWAKENING_BEATS.length; index += 1) {
        if (isCancelled()) return;

        const beat = STORY_AWAKENING_BEATS[index];
        setBeatIndex(index);
        setMood(beat.mood);

        await blinkClosed(
          index === 0
            ? (beat.blinkClosedMs ?? FIRST_CLOSED_MS)
            : (beat.blinkClosedMs ?? BLINK_CLOSED_MS_DEFAULT),
        );
        if (isCancelled()) return;

        await blinkOpen(beat);
        if (isCancelled()) return;

        await revealContent(beat);
        if (isCancelled()) return;

        await typeAwakeningBeat(beat);
        if (isCancelled()) return;
      }

      await blinkClosed(BLINK_CLOSED_MS_DEFAULT);
      if (isCancelled()) return;

      setPhase("containment");
      setTankVisible(true);
      setBeatText("");
      setContentVisible(false);
      setRevealLevel(0);
      setContainmentIndex(0);
      await waitCinematicMs(CONTAINMENT_TRANSITION_MS, isCancelled, isPaused);
      if (isCancelled()) return;

      setContentVisible(true);

      for (let index = 0; index < STORY_CONTAINMENT_BEATS.length; index += 1) {
        if (isCancelled()) return;

        setContainmentIndex(index);
        await typeContainmentBeat(STORY_CONTAINMENT_BEATS[index]);
        if (isCancelled()) return;
      }

      const lastBeat =
        STORY_CONTAINMENT_BEATS[STORY_CONTAINMENT_BEATS.length - 1];
      setRevealLevel(lastBeat.revealLevel);
      setBeatText(lastBeat.text);
      setBeatTyping(false);

      await waitCinematicMs(CONTAINMENT_FINAL_HOLD_MS, isCancelled, isPaused);
      if (isCancelled()) return;

      setPhase("fade");
      setFadeOut(true);
      await waitCinematicMs(AWAKENING_FADE_MS, isCancelled, isPaused);
      if (isCancelled()) return;

      navigate("/", { replace: true });
    }

    void runSequence();

    return () => {
      cancelled = true;
    };
  }, [loading, navigate, user]);

  const povClassName = [
    "storyAwakening__pov",
    eyesOpen ? "storyAwakening__pov--eyes-open" : "storyAwakening__pov--eyes-closed",
    `storyAwakening__pov--mood-${mood}`,
  ]
    .filter(Boolean)
    .join(" ");

  const statusLabel = paused
    ? "PAUSED"
    : isContainment
      ? revealLevel >= 3
        ? "BREATHING ASSIST"
        : revealLevel >= 1
          ? "IMMOBILE"
          : "SUBMERGED"
      : "DISORIENTED";

  const moduleLabel = isContainment ? "IMMERSION" : "CONSCIOUSNESS";
  const sequenceLabel = isContainment
    ? "MAIN STORYLINE // SEQUENCE 02"
    : "MAIN STORYLINE // SEQUENCE 01";
  const titleLabel = isContainment ? "CONTAINMENT" : "AWAKENING";

  return (
    <div
      className={`storyAwakening${
        paused ? " storyAwakening--paused" : ""
      }${fadeOut ? " storyAwakening--fade-out" : ""}${
        isContainment ? " storyAwakening--containment" : ""
      }`}
    >
      <div className="storyAwakening__bg" />
      <div className="storyAwakening__scanlines" />
      <div className="storyAwakening__vignette" />

      <div className="storyAwakening__frame storyAwakening__frame--tl" />
      <div className="storyAwakening__frame storyAwakening__frame--tr" />
      <div className="storyAwakening__frame storyAwakening__frame--bl" />
      <div className="storyAwakening__frame storyAwakening__frame--br" />

      <div className="storyAwakening__hud storyAwakening__hud--tl">
        <span>MODULE</span>
        <span className="storyAwakening__hudVal">{moduleLabel}</span>
      </div>
      <div className="storyAwakening__hud storyAwakening__hud--tr">
        <span>OPERATOR</span>
        <span className="storyAwakening__hudVal storyAwakening__hudVal--accent">
          {username.toUpperCase()}
        </span>
      </div>
      <div className="storyAwakening__hud storyAwakening__hud--bl">
        <span>STATUS</span>
        <span className="storyAwakening__hudVal storyAwakening__hudVal--live">
          {statusLabel}
        </span>
      </div>
      <div className="storyAwakening__hud storyAwakening__hud--br">
        <span>BEAT</span>
        <span className="storyAwakening__hudVal">
          {String(currentBeatNumber).padStart(2, "0")}
          <span className="storyAwakening__hudSub">
            /{String(totalBeats).padStart(2, "0")}
          </span>
        </span>
      </div>

      <button
        type="button"
        className="storyAwakening__pauseBtn"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={paused ? "Resume awakening" : "Pause awakening"}
      >
        {paused ? "▶ RESUME" : "❚❚ PAUSE"}
      </button>

      <main className="storyAwakening__main">
        <header className="storyAwakening__header">
          <p className="storyAwakening__eyebrow">{sequenceLabel}</p>
          <h1 className="storyAwakening__title">{titleLabel}</h1>
          {isContainment ? (
            <p className="storyAwakening__subtitle">
              Unknown chamber — identity of enclosure not confirmed
            </p>
          ) : null}
        </header>

        <div className="storyAwakening__stage">
          <div
            className={`storyAwakening__viewStack${
              tankVisible ? " storyAwakening__viewStack--tank" : ""
            }`}
          >
            <div
              className={povClassName}
              style={{ "--lid-height": `${lidOpenPct}%` } as CSSProperties}
              aria-hidden={tankVisible}
              aria-label="First-person awakening view"
            >
              <div className="storyAwakening__povPulse" />
              <div className="storyAwakening__povAtmosphere">
                <div className="storyAwakening__povBlur" />
                <div className="storyAwakening__povLight" />
                <div className="storyAwakening__povWash" />
              </div>

              <div
                className={`storyAwakening__povContent${
                  contentVisible && !tankVisible
                    ? " storyAwakening__povContent--visible"
                    : ""
                }`}
              >
                {beatText && !tankVisible ? (
                  <p className="storyAwakening__povThought">
                    {formatThought(beatText)}
                    {beatTyping ? (
                      <span className="storyAwakening__povCursor" aria-hidden>
                        ▌
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>

              <div className="storyAwakening__povLid storyAwakening__povLid--top" />
              <div className="storyAwakening__povLid storyAwakening__povLid--bottom" />
            </div>

            <div
              className={`storyAwakening__tankWrap${
                tankVisible ? " storyAwakening__tankWrap--visible" : ""
              }`}
            >
              <SuspensionTankPOV revealLevel={revealLevel} />
              <div
                className={`storyAwakening__tankCaption${
                  contentVisible && tankVisible
                    ? " storyAwakening__tankCaption--visible"
                    : ""
                }`}
              >
                {beatText && tankVisible ? (
                  <p className="storyAwakening__povThought storyAwakening__povThought--tank">
                    {formatThought(beatText)}
                    {beatTyping ? (
                      <span className="storyAwakening__povCursor" aria-hidden>
                        ▌
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
