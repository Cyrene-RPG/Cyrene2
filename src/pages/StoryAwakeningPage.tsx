import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  AWAKENING_FADE_MS,
  AWAKENING_HOLD_MS,
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
import { waitCinematicMs } from "../lib/cinematic-wait";
import "./StoryAwakeningPage.css";

type Phase = "beats" | "hold" | "fade";

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
  const [eyesOpen, setEyesOpen] = useState(false);
  const [lidOpenPct, setLidOpenPct] = useState(50);
  const [mood, setMood] = useState<AwakeningMood>("dark");
  const [beatText, setBeatText] = useState("");
  const [beatTyping, setBeatTyping] = useState(false);
  const [memoryFragments, setMemoryFragments] = useState<string[]>([]);
  const [contentVisible, setContentVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const username =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "UNKNOWN";

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (loading || !user || phase !== "beats") return;

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

    async function typeBeat(beat: AwakeningBeat) {
      setBeatTyping(true);
      const charMs = beat.charMs ?? BEAT_CHAR_MS_DEFAULT;
      for (let index = 0; index <= beat.text.length; index += 1) {
        if (isCancelled()) return;
        setBeatText(beat.text.slice(0, index));
        await waitCinematicMs(charMs, isCancelled, isPaused);
      }
      setBeatTyping(false);
      await waitCinematicMs(
        beat.holdMs ?? BEAT_HOLD_MS_DEFAULT,
        isCancelled,
        isPaused,
      );
    }

    async function runBeats() {
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

        await typeBeat(beat);
        if (isCancelled()) return;

        setMemoryFragments((lines) => [...lines, beat.text]);
      }

      const lastBeat = STORY_AWAKENING_BEATS[STORY_AWAKENING_BEATS.length - 1];
      setPhase("hold");
      setMood(lastBeat.mood);
      setEyesOpen(true);
      setLidOpenPct(lastBeat.lidOpen);
      setBeatText(lastBeat.text);
      setContentVisible(true);
      setBeatTyping(false);

      await waitCinematicMs(AWAKENING_HOLD_MS, isCancelled, isPaused);
      if (isCancelled()) return;

      setPhase("fade");
      setFadeOut(true);
      await waitCinematicMs(AWAKENING_FADE_MS, isCancelled, isPaused);
      if (isCancelled()) return;

      navigate("/", { replace: true });
    }

    void runBeats();

    return () => {
      cancelled = true;
    };
  }, [loading, navigate, phase, user]);

  const povClassName = [
    "storyAwakening__pov",
    eyesOpen ? "storyAwakening__pov--eyes-open" : "storyAwakening__pov--eyes-closed",
    `storyAwakening__pov--mood-${mood}`,
    phase === "hold" ? "storyAwakening__pov--hold" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`storyAwakening${
        paused ? " storyAwakening--paused" : ""
      }${fadeOut ? " storyAwakening--fade-out" : ""}`}
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
        <span className="storyAwakening__hudVal">CONSCIOUSNESS</span>
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
          {paused ? "PAUSED" : phase === "hold" ? "SURFACING" : "DISORIENTED"}
        </span>
      </div>
      <div className="storyAwakening__hud storyAwakening__hud--br">
        <span>BEAT</span>
        <span className="storyAwakening__hudVal">
          {String(Math.min(beatIndex + 1, STORY_AWAKENING_BEATS.length)).padStart(2, "0")}
          <span className="storyAwakening__hudSub">
            /{String(STORY_AWAKENING_BEATS.length).padStart(2, "0")}
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
          <p className="storyAwakening__eyebrow">MAIN STORYLINE // SEQUENCE 01</p>
          <h1 className="storyAwakening__title">AWAKENING</h1>
        </header>

        <div className="storyAwakening__stage">
          <div
            className={povClassName}
            style={{ "--lid-height": `${lidOpenPct}%` } as CSSProperties}
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
                contentVisible ? " storyAwakening__povContent--visible" : ""
              }`}
            >
              {memoryFragments.length > 1 ? (
                <div className="storyAwakening__povMemory" aria-hidden>
                  {memoryFragments.slice(0, -1).map((line) => (
                    <p key={line} className="storyAwakening__povMemoryLine">
                      {line.replace(/\n/g, " ")}
                    </p>
                  ))}
                </div>
              ) : null}

              {beatText ? (
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
        </div>
      </main>
    </div>
  );
}
