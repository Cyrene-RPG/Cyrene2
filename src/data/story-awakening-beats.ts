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
};

export const STORY_AWAKENING_BEATS: AwakeningBeat[] = [
  {
    id: "void",
    text: "Nothing.",
    mood: "dark",
    lidOpen: 50,
    charMs: 48,
    holdMs: 1800,
    blinkClosedMs: 1400,
  },
  {
    id: "light",
    text: "Then light—\n\nwrong light.\nIt pours in at the edges until everything burns white.",
    mood: "bright",
    lidOpen: 36,
    charMs: 26,
    holdMs: 1500,
    blinkClosedMs: 320,
    lidOpenMs: 680,
  },
  {
    id: "unstable",
    text: "Your vision won't hold.\nIt slips. Snaps. Refuses to stay in one place.",
    mood: "unstable",
    lidOpen: 32,
    charMs: 30,
    holdMs: 1600,
    blinkClosedMs: 300,
  },
  {
    id: "pressure",
    text: "Pressure builds behind your eyes—\nlike dragging yourself up from water so deep you've forgotten the surface.",
    mood: "pressure",
    lidOpen: 22,
    charMs: 32,
    holdMs: 2600,
    blinkClosedMs: 280,
    lidOpenMs: 900,
  },
];

export const BEAT_CHAR_MS_DEFAULT = 34;
export const BEAT_HOLD_MS_DEFAULT = 1300;
export const BLINK_CLOSED_MS_DEFAULT = 340;
export const FIRST_CLOSED_MS = 1100;
export const LID_OPEN_MS_DEFAULT = 560;
export const AWAKENING_HOLD_MS = 3200;
