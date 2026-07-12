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
    text: "You try to move. Nothing answers.",
    revealLevel: 1,
    charMs: 54,
    holdMs: 2600,
  },
  {
    id: "pinned",
    text: "Your arms hang wrong — weightless, but locked at the wrists.",
    revealLevel: 1,
    charMs: 52,
    holdMs: 2800,
  },
  {
    id: "fluid",
    text: "Cold clings to your skin. Something thick drifts around you.",
    revealLevel: 2,
    charMs: 54,
    holdMs: 3000,
  },
  {
    id: "mask",
    text: "A rigid seal covers your nose and mouth. Air pushes in — steady, forced, not yours.",
    revealLevel: 3,
    charMs: 50,
    holdMs: 3400,
  },
  {
    id: "held",
    text: "You are not standing. Not falling. Just held in place — waiting.",
    revealLevel: 4,
    charMs: 52,
    holdMs: 4000,
  },
];

export const CONTAINMENT_TRANSITION_MS = 1600;
export const CONTAINMENT_CHAR_MS_DEFAULT = 52;
export const CONTAINMENT_HOLD_MS_DEFAULT = 2800;
export const CONTAINMENT_FINAL_HOLD_MS = 4500;
