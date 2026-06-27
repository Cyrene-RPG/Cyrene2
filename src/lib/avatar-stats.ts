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

export const REROLLS_PER_ABILITY = 1;
export const HUMAN_BONUS_POINTS = 2;
/** Max score from 4d6 before species or human bonus points apply. */
export const PRE_RACIAL_STAT_MAX = 16;

export type AbilityRollResult = {
  dice: number[];
  kept: number[];
  total: number;
};

export type StatDiceRolls = Partial<Record<Ability, number[]>>;

export function formatOperatorIdentificationNumber(
  rolls: StatDiceRolls | null | undefined,
): { value: string; complete: boolean } {
  if (!rolls) {
    return { value: "PENDING", complete: false };
  }

  const segments = ABILITIES.map((ability) => {
    const kept = rolls[ability];
    if (!kept?.length) return null;
    return kept.join("");
  }).filter((segment): segment is string => segment != null);

  if (segments.length === 0) {
    return { value: "PENDING", complete: false };
  }

  const complete = ABILITIES.every((ability) => rolls[ability]?.length === 3);
  return { value: segments.join("-"), complete };
}

export function normalizeIdentificationNumber(value: string): string {
  return value.replace(/-/g, "");
}

function getCompleteIdentificationSegments(
  rolls: StatDiceRolls,
): string[] | null {
  const segments = ABILITIES.map((ability) => {
    const kept = rolls[ability];
    if (kept?.length !== 3) return null;
    return kept.join("");
  });

  if (segments.some((segment) => segment == null)) return null;
  return segments as string[];
}

export function formatIdentificationFromSegments(segments: string[]): string {
  return segments.join("-");
}

function isIdentificationTaken(value: string, taken: Set<string>): boolean {
  const normalized = normalizeIdentificationNumber(value);
  for (const existing of taken) {
    if (normalizeIdentificationNumber(existing) === normalized) {
      return true;
    }
  }
  return false;
}

function findUniqueSegmentPermutation(
  segments: string[],
  taken: Set<string>,
): string | null {
  const working = [...segments];

  function permute(start: number): string | null {
    if (start === working.length) {
      const candidate = formatIdentificationFromSegments(working);
      return isIdentificationTaken(candidate, taken) ? null : candidate;
    }

    for (let index = start; index < working.length; index += 1) {
      [working[start], working[index]] = [working[index], working[start]];
      const found = permute(start + 1);
      if (found) return found;
      [working[start], working[index]] = [working[index], working[start]];
    }

    return null;
  }

  return permute(0);
}

function findUniqueWithZeroPadding(
  base: string,
  taken: Set<string>,
): string | null {
  for (let zeroCount = 1; zeroCount <= 16; zeroCount += 1) {
    const candidate = `${base}-${"0".repeat(zeroCount)}`;
    if (!isIdentificationTaken(candidate, taken)) {
      return candidate;
    }
  }

  return null;
}

function findUniqueWithZeroPaddingPermutations(
  segments: string[],
  taken: Set<string>,
): string | null {
  const working = [...segments];
  let zeroPadded: string | null = null;

  function permute(start: number): boolean {
    if (start === working.length) {
      const base = formatIdentificationFromSegments(working);
      zeroPadded = findUniqueWithZeroPadding(base, taken);
      return zeroPadded != null;
    }

    for (let index = start; index < working.length; index += 1) {
      [working[start], working[index]] = [working[index], working[start]];
      if (permute(start + 1)) return true;
      [working[start], working[index]] = [working[index], working[start]];
    }

    return false;
  }

  return permute(0) ? zeroPadded : null;
}

export function resolveUniqueIdentificationNumber(
  rolls: StatDiceRolls,
  taken: Set<string>,
): string {
  const segments = getCompleteIdentificationSegments(rolls);
  if (!segments) {
    throw new Error("Stat dice imprint is incomplete.");
  }

  const canonical = formatIdentificationFromSegments(segments);
  if (!isIdentificationTaken(canonical, taken)) {
    return canonical;
  }

  const shuffled = findUniqueSegmentPermutation(segments, taken);
  if (shuffled) {
    return shuffled;
  }

  const zeroPadded = findUniqueWithZeroPadding(canonical, taken);
  if (zeroPadded) {
    return zeroPadded;
  }

  const zeroPaddedShuffle = findUniqueWithZeroPaddingPermutations(segments, taken);
  if (zeroPaddedShuffle) {
    return zeroPaddedShuffle;
  }

  throw new Error("Could not assign a unique operator ID.");
}

export function omitStatDiceRoll(
  rolls: StatDiceRolls | undefined,
  ability: Ability,
): StatDiceRolls | undefined {
  if (!rolls?.[ability]) return rolls;

  const next: StatDiceRolls = { ...rolls };
  delete next[ability];
  return Object.keys(next).length > 0 ? next : undefined;
}

export function trimStatDiceRollsFromIndex(
  rolls: StatDiceRolls | undefined,
  fromIndex: number,
): StatDiceRolls | undefined {
  if (!rolls) return undefined;

  const next: StatDiceRolls = { ...rolls };
  for (let index = fromIndex; index < ABILITIES.length; index += 1) {
    delete next[ABILITIES[index]];
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

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

  if (speciesId === "elf") {
    mods.DEX = 2;
    mods.INT = 1;
  } else if (speciesId === "dwarves") {
    mods.STR = 1;
    mods.CON = 1;
  } else if (speciesId === "cambions") {
    mods.STR = 1;
    mods.CON = 1;
  } else if (speciesId === "orcs") {
    mods.STR = 2;
  } else if (speciesId === "dragonborn") {
    mods.STR = 2;
  }

  if (subspeciesId === "ice-elf") {
    mods.INT = (mods.INT ?? 0) + 1;
    mods.WIS = (mods.WIS ?? 0) + 1;
  } else if (subspeciesId === "amazonian-elf") {
    mods.WIS = (mods.WIS ?? 0) + 1;
    mods.CHA = (mods.CHA ?? 0) + 1;
  } else if (subspeciesId === "half-elf") {
    mods.DEX = (mods.DEX ?? 0) + 1;
    mods.CHA = (mods.CHA ?? 0) + 1;
  } else if (subspeciesId === "half-orc") {
    mods.STR = (mods.STR ?? 0) + 1;
    mods.CON = (mods.CON ?? 0) + 1;
  } else if (subspeciesId === "faerie") {
    mods.CHA = (mods.CHA ?? 0) + 1;
  } else if (subspeciesId === "demon-born") {
    mods.CHA = (mods.CHA ?? 0) + 1;
  } else if (subspeciesId === "cursed") {
    mods.CON = (mods.CON ?? 0) - 1;
  } else if (subspeciesId === "pact-made") {
    mods.STR = (mods.STR ?? 0) + 1;
  }

  return mods;
}

export function clampPreRacialScores(base: AbilityScores): AbilityScores {
  const next = { ...base };
  for (const ability of ABILITIES) {
    next[ability] = Math.min(next[ability], PRE_RACIAL_STAT_MAX);
  }
  return next;
}

export function applyAbilityModifiers(
  base: AbilityScores,
  modifiers: Partial<AbilityScores>,
): AbilityScores {
  const next = clampPreRacialScores(base);
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
  return formatSignedModifier(mod);
}

export function formatSignedModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
