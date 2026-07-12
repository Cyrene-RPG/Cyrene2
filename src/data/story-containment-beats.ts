export type ContainmentRevealLevel = 0 | 1 | 2 | 3 | 4;

export type ContainmentBeat = {
  id: string;
  text: string;
  revealLevel: ContainmentRevealLevel;
  charMs?: number;
  holdMs?: number;
};

export const STORY_CONTAINMENT_BEATS: ContainmentBeat[] = [
  {
    id: "still",
    text: "You try to move. Your body doesn't answer.",
    revealLevel: 1,
    charMs: 54,
    holdMs: 2800,
  },
  {
    id: "pinned",
    text: "Your wrists are caught. You hang there anyway — like you forgot what weight is supposed to feel like.",
    revealLevel: 1,
    charMs: 48,
    holdMs: 3200,
  },
  {
    id: "fluid",
    text: "It's cold. Something slow moves around you.",
    revealLevel: 2,
    charMs: 56,
    holdMs: 3000,
  },
  {
    id: "mask",
    text: "There's something on your face. Over your nose. Your mouth. It keeps breathing for you.",
    revealLevel: 3,
    charMs: 50,
    holdMs: 3600,
  },
  {
    id: "held",
    text: "You're not lying down. You're not standing. You're just here.",
    revealLevel: 4,
    charMs: 52,
    holdMs: 4000,
  },
];

export const CONTAINMENT_TRANSITION_MS = 1600;
export const CONTAINMENT_CHAR_MS_DEFAULT = 52;
export const CONTAINMENT_HOLD_MS_DEFAULT = 2800;
export const CONTAINMENT_FINAL_HOLD_MS = 4500;
