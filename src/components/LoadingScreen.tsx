import { useEffect, useRef, useState } from "react";
import "./LoadingScreen.css";

type LoadingStep = {
  label: string;
  weight: number;
};

const LOADING_STEPS: LoadingStep[] = [
  { label: "INITIALIZING CORE SYSTEMS", weight: 12 },
  { label: "LOADING CITY ENVIRONMENT", weight: 18 },
  { label: "CONNECTING NEURAL NETWORK", weight: 16 },
  { label: "SYNCING PLAYER REGISTRY", weight: 20 },
  { label: "MAPPING DISTRICT GRID", weight: 16 },
  { label: "PREPARING INTERFACE", weight: 18 },
];

const RESUME_LOADING_STEPS: LoadingStep[] = [
  { label: "RESTORING SESSION DATA", weight: 18 },
  { label: "LOADING OPERATOR FILE", weight: 20 },
  { label: "SYNCING MISSION STATE", weight: 22 },
  { label: "RECONSTRUCTING NARRATIVE", weight: 20 },
  { label: "PREPARING DROP ZONE", weight: 20 },
];

const BOOT_LOG = [
  "CYRENE OS — AUTO-UPDATE ONLINE",
  "CPU: NEURAL CORE ONLINE",
  "MEM: 16384MB OK",
  "GPU: RENDER PIPELINE OK",
  "NET: ESTABLISHING UPLINK...",
];

const RESUME_BOOT_LOG = [
  "SESSION CACHE: FOUND",
  "AVATAR REGISTRY: MOUNTED",
  "MISSION STATE: QUEUED",
  "NARRATIVE TRACE: REBUILDING",
  "DROP COORDS: PENDING",
];

const LOADING_TIPS = [
  "Every action in Cyrene is recorded.",
  "The city never sleeps. Neither should you.",
  "Choose your path. Survive the districts.",
  "Most operators are forgotten. Will you be?",
];

const RESUME_LOADING_TIPS = [
  "Your last scene is cached locally on this device.",
  "Mission progress is tied to your active avatar.",
  "The city remembers every operator who returns.",
  "Pick up the story where you left off.",
];

type Props = {
  authReady?: boolean;
  onComplete: () => void;
  variant?: "boot" | "resume";
};

export default function LoadingScreen({
  authReady = true,
  onComplete,
  variant = "boot",
}: Props) {
  const isResume = variant === "resume";
  const steps = isResume ? RESUME_LOADING_STEPS : LOADING_STEPS;
  const bootLog = isResume ? RESUME_BOOT_LOG : BOOT_LOG;
  const tips = isResume ? RESUME_LOADING_TIPS : LOADING_TIPS;
  const forceReadyMs = isResume ? 3500 : 6000;
  const readyLabel = isResume ? "SESSION RESTORED" : "SYSTEM READY";
  const eyebrow = isResume ? "SESSION UPLINK" : "CYBER FANTASY RPG";
  const tagline = isResume ? "Re-entering the grid" : "The Sleepless City of Sin";
  const [poweredOn, setPoweredOn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<"loading" | "ready" | "exit">("loading");
  const [glitch, setGlitch] = useState(false);
  const [forceReady, setForceReady] = useState(false);
  const [buildLabel, setBuildLabel] = useState("BUILD …");
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const canFinish = authReady || forceReady;
  const currentStep = steps[stepIndex]?.label ?? "FINALIZING";

  useEffect(() => {
    void window.cyreneDesktop?.getAppInfo().then((info) => {
      setBuildLabel(`BUILD ${info.version}`);
    });
  }, []);

  useEffect(() => {
    const powerTimer = setTimeout(() => setPoweredOn(true), 500);
    return () => clearTimeout(powerTimer);
  }, []);

  useEffect(() => {
    if (!poweredOn) return;

    let index = 0;
    const logTimer = setInterval(() => {
      if (index < bootLog.length) {
        setLogLines((prev) => [...prev, bootLog[index]]);
        index += 1;
        return;
      }
      clearInterval(logTimer);
    }, 320);

    return () => clearInterval(logTimer);
  }, [bootLog, poweredOn]);

  useEffect(() => {
    const forceTimer = setTimeout(() => setForceReady(true), forceReadyMs);
    return () => clearTimeout(forceTimer);
  }, [forceReadyMs]);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 2800);
    return () => clearInterval(tipTimer);
  }, [tips.length]);

  useEffect(() => {
    const glitchTimer = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 2400);
    return () => clearInterval(glitchTimer);
  }, []);

  useEffect(() => {
    if (!poweredOn || finishedRef.current) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const cap = canFinish ? 100 : 88;
        if (prev >= cap) return cap;

        const increment = canFinish && prev >= 85 ? 3 : 0.8 + Math.random() * 1.4;
        const next = Math.min(cap, prev + increment);

        const thresholds = steps.reduce<number[]>((acc, _step, i) => {
          const sum = steps.slice(0, i + 1).reduce((s, x) => s + x.weight, 0);
          acc.push((sum / 100) * 100);
          return acc;
        }, []);

        const newStep = thresholds.findIndex((t) => next < t);
        setStepIndex(newStep === -1 ? steps.length - 1 : Math.max(0, newStep));

        return next;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [canFinish, poweredOn, steps]);

  useEffect(() => {
    if (finishedRef.current || !canFinish || progress < 99) return;

    finishedRef.current = true;
    setPhase("ready");

    window.setTimeout(() => {
      setPhase("exit");
      onCompleteRef.current();
    }, 1200);
  }, [canFinish, progress]);

  return (
    <div
      className={`loadScreen loadScreen--${phase} ${
        poweredOn ? "loadScreen--powered" : "loadScreen--poweron"
      }`}
    >
      <div className="loadScreen__bg" />
      <div className="loadScreen__grid" />
      <div className="loadScreen__scan" />
      <div className="loadScreen__vignette" />
      <div className="loadScreen__flicker" />

      <div className="loadScreen__ring loadScreen__ring--1" />
      <div className="loadScreen__ring loadScreen__ring--2" />
      <div className="loadScreen__ring loadScreen__ring--3" />

      <div className="loadScreen__bootLog">
        {logLines.map((line) => (
          <div key={line} className="loadScreen__bootLine">
            <span className="loadScreen__bootPrompt">&gt;</span> {line}
          </div>
        ))}
      </div>

      <div className="loadScreen__content">
        <div className="loadScreen__eyebrow">{eyebrow}</div>

        <h1 className={`loadScreen__logo ${glitch ? "loadScreen__logo--glitch" : ""}`}>
          CYRENE
        </h1>

        <p className="loadScreen__tagline">{tagline}</p>

        <div className="loadScreen__progressWrap">
          <div className="loadScreen__progressMeta">
            <span className="loadScreen__step">{currentStep}</span>
            <span className="loadScreen__pct">{Math.floor(progress)}%</span>
          </div>

          <div className="loadScreen__progressTrack">
            <div
              className="loadScreen__progressFill"
              style={{ width: `${progress}%` }}
            />
            <div className="loadScreen__progressGlow" style={{ left: `${progress}%` }} />
          </div>

          <div className="loadScreen__segments">
            {steps.map((step, i) => (
              <span
                key={step.label}
                className={`loadScreen__segment ${
                  i <= stepIndex ? "loadScreen__segment--lit" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className="loadScreen__tip">
          <span className="loadScreen__tipLabel">INTEL</span>
          {tips[tipIndex]}
        </div>

        {phase === "ready" && (
          <div className="loadScreen__ready">{readyLabel}</div>
        )}
      </div>

      <div className="loadScreen__corner loadScreen__corner--tl" />
      <div className="loadScreen__corner loadScreen__corner--tr" />
      <div className="loadScreen__corner loadScreen__corner--bl" />
      <div className="loadScreen__corner loadScreen__corner--br" />

      <div className="loadScreen__footer">
        <span>{buildLabel}</span>
        <span>CYRENE OS</span>
        <span>{window.cyreneDesktop?.isDesktop ? "DESKTOP CLIENT" : "WEB CLIENT"}</span>
      </div>
    </div>
  );
}
