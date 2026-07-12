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
    text: "I can't move.\nMy arms won't lift.\nMy wrists are caught and I don't know when that happened.",
    revealLevel: 1,
    charMs: 46,
    holdMs: 3400,
  },
  {
    id: "fluid",
    text: "It's cold.\nThere's something all around me....liquid? Maybe.\nI can't turn my head to see.",
    revealLevel: 2,
    charMs: 48,
    holdMs: 3600,
  },
  {
    id: "mask",
    text: "There's something strapped over my nose and mouth.\nI didn't put it there.\nIt's breathing for me.",
    revealLevel: 3,
    charMs: 44,
    holdMs: 4000,
  },
  {
    id: "held",
    text: "I'm not on the floor.\nI'm not standing up.\nSo what the hell is holding me here.",
    revealLevel: 4,
    charMs: 46,
    holdMs: 4200,
  },
];

export const CONTAINMENT_TRANSITION_MS = 1600;
export const CONTAINMENT_CHAR_MS_DEFAULT = 46;
export const CONTAINMENT_HOLD_MS_DEFAULT = 3400;
export const CONTAINMENT_FINAL_HOLD_MS = 4500;
