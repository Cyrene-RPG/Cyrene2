export type AwakeningMood = "dark" | "bright" | "unstable" | "pressure";

export type AwakeningBeat = {
  id: string;
  text: string;
  mood: AwakeningMood;
  /** Eyelid opening — lower means more open. */
  lidOpen: number;
  charMs?: number;
  holdMs?: number;
  blinkClosedMs?: number;
  lidOpenMs?: number;
  settleMs?: number;
};

export const STORY_AWAKENING_BEATS: AwakeningBeat[] = [
  {
    id: "void",
    text: "Darkness....",
    mood: "dark",
    lidOpen: 48,
    charMs: 90,
    holdMs: 4200,
    blinkClosedMs: 3200,
    lidOpenMs: 1400,
    settleMs: 1200,
  },
  {
    id: "light",
    text: "Then light — too bright, smeared at the edges.",
    mood: "bright",
    lidOpen: 34,
    charMs: 72,
    holdMs: 3800,
    blinkClosedMs: 900,
    lidOpenMs: 1600,
    settleMs: 1000,
  },
  {
    id: "unstable",
    text: "Your vision won't hold steady.",
    mood: "unstable",
    lidOpen: 30,
    charMs: 78,
    holdMs: 4000,
    blinkClosedMs: 850,
    lidOpenMs: 1500,
    settleMs: 1100,
  },
  {
    id: "pressure",
    text: "A pressure builds behind your eyes, like surfacing from deep water.",
    mood: "pressure",
    lidOpen: 20,
    charMs: 82,
    holdMs: 5200,
    blinkClosedMs: 900,
    lidOpenMs: 1800,
    settleMs: 1400,
  },
];

export const BEAT_CHAR_MS_DEFAULT = 76;
export const BEAT_HOLD_MS_DEFAULT = 3600;
export const BLINK_CLOSED_MS_DEFAULT = 820;
export const FIRST_CLOSED_MS = 2800;
export const LID_OPEN_MS_DEFAULT = 1500;
export const SETTLE_AFTER_OPEN_MS = 1100;
export const CONTENT_REVEAL_MS = 900;
export const AWAKENING_HOLD_MS = 6500;
export const AWAKENING_FADE_MS = 2800;
