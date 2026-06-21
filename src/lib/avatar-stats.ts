export const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

export type Ability = (typeof ABILITIES)[number];

export type AbilityScores = Record<Ability, number>;

export const ABILITY_LABELS: Record<Ability, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma",
};

export const REROLLS_PER_ABILITY = 2;
export const HUMAN_BONUS_POINTS = 3;

export type AbilityRollResult = {
  dice: number[];
  kept: number[];
  total: number;
};

export function createEmptyAbilityScores(): AbilityScores {
  return { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
}

export function rollAbilityScore(): AbilityRollResult {
  const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  const sorted = [...dice].sort((a, b) => a - b);
  const kept = sorted.slice(1);
  const total = kept.reduce((sum, value) => sum + value, 0);
  return { dice, kept, total };
}

export function speciesUsesBonusPoints(speciesId: string | null): boolean {
  return speciesId === "human";
}

export function getSpeciesAbilityModifiers(
  speciesId: string | null,
  subspeciesId: string | null,
): Partial<AbilityScores> {
  const mods: Partial<AbilityScores> = {};

  if (speciesId === "dwarves") {
    mods.STR = 1;
    mods.CON = 1;
    mods.INT = 1;
  } else if (speciesId === "cambions") {
    mods.CON = 1;
    mods.STR = 1;
    mods.WIS = 1;
    mods.INT = 1;
  } else if (speciesId === "orcs") {
    mods.STR = 2;
  } else if (speciesId === "dragonborn") {
    mods.STR = 2;
    mods.CON = 2;
  }

  if (subspeciesId === "ice-elf") {
    mods.INT = (mods.INT ?? 0) + 1;
    mods.WIS = (mods.WIS ?? 0) + 2;
  } else if (subspeciesId === "amazonian-elf") {
    mods.INT = (mods.INT ?? 0) + 1;
    mods.WIS = (mods.WIS ?? 0) + 1;
    mods.CHA = (mods.CHA ?? 0) + 1;
  } else if (subspeciesId === "half-elf") {
    mods.DEX = (mods.DEX ?? 0) + 1;
    mods.INT = (mods.INT ?? 0) + 1;
  } else if (subspeciesId === "half-orc") {
    mods.STR = (mods.STR ?? 0) + 2;
    mods.CON = (mods.CON ?? 0) + 1;
  } else if (subspeciesId === "faerie") {
    mods.CHA = (mods.CHA ?? 0) + 1;
  } else if (subspeciesId === "cursed") {
    mods.CON = (mods.CON ?? 0) - 1;
  } else if (subspeciesId === "pact-made") {
    mods.STR = (mods.STR ?? 0) + 1;
  }

  return mods;
}

export function applyAbilityModifiers(
  base: AbilityScores,
  modifiers: Partial<AbilityScores>,
): AbilityScores {
  const next = { ...base };
  for (const ability of ABILITIES) {
    const mod = modifiers[ability] ?? 0;
    if (mod !== 0) next[ability] += mod;
  }
  return next;
}

export function hasCompleteAbilityScores(
  scores: Partial<AbilityScores> | null | undefined,
): scores is AbilityScores {
  if (!scores) return false;
  return ABILITIES.every(
    (ability) =>
      typeof scores[ability] === "number" && !Number.isNaN(scores[ability]),
  );
}

export function formatAbilityRoll(roll: AbilityRollResult | null): string {
  if (!roll) return "—";
  return `${roll.kept.join(" + ")} = ${roll.total}`;
}

/** Pathfinder ability modifier: floor((score - 10) / 2) */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatAbilityModifier(score: number): string {
  const mod = getAbilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
