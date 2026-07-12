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
    charMs: 58,
    holdMs: 2400,
    blinkClosedMs: 2000,
    lidOpenMs: 900,
    settleMs: 500,
  },
  {
    id: "light",
    text: "Then light — too bright, smeared at the edges.",
    mood: "bright",
    lidOpen: 34,
    charMs: 52,
    holdMs: 2400,
    blinkClosedMs: 550,
    lidOpenMs: 1000,
    settleMs: 550,
  },
  {
    id: "unstable",
    text: "Your vision won't hold steady.",
    mood: "unstable",
    lidOpen: 30,
    charMs: 54,
    holdMs: 2600,
    blinkClosedMs: 520,
    lidOpenMs: 950,
    settleMs: 600,
  },
  {
    id: "pressure",
    text: "A pressure builds behind your eyes, like surfacing from deep water.",
    mood: "pressure",
    lidOpen: 20,
    charMs: 58,
    holdMs: 3600,
    blinkClosedMs: 520,
    lidOpenMs: 1100,
    settleMs: 700,
  },
];

export const BEAT_CHAR_MS_DEFAULT = 55;
export const BEAT_HOLD_MS_DEFAULT = 2200;
export const BLINK_CLOSED_MS_DEFAULT = 520;
export const FIRST_CLOSED_MS = 1800;
export const LID_OPEN_MS_DEFAULT = 950;
export const SETTLE_AFTER_OPEN_MS = 550;
export const CONTENT_REVEAL_MS = 450;
export const AWAKENING_HOLD_MS = 4200;
export const AWAKENING_FADE_MS = 1800;
