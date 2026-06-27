import type { Ability } from "../lib/avatar-stats";

export type SkillId =
  | "athletics"
  | "close-combat"
  | "firearms"
  | "heavy-weapons"
  | "hacking"
  | "electronics"
  | "engineering"
  | "cybertech"
  | "demolitions"
  | "drone-control"
  | "mechanics"
  | "persuasion"
  | "deception"
  | "intimidation"
  | "negotiation"
  | "performance"
  | "leadership"
  | "streetwise"
  | "etiquette"
  | "acrobatics"
  | "stealth"
  | "sleight-of-hand"
  | "survival"
  | "endurance";

export type SkillGroupId = "body" | "combat" | "tech" | "presence";

export type SkillDefinition = {
  id: SkillId;
  name: string;
  ability: Ability;
  scope: string;
  group: SkillGroupId;
};

export const SKILL_GROUP_LABELS: Record<SkillGroupId, string> = {
  body: "Body",
  combat: "Combat",
  tech: "Tech",
  presence: "Presence",
};

export const SKILLS: SkillDefinition[] = [
  {
    id: "athletics",
    name: "Athletics",
    ability: "STR",
    scope: "Climbing, jumping, swimming, grappling",
    group: "body",
  },
  {
    id: "acrobatics",
    name: "Acrobatics",
    ability: "DEX",
    scope: "Balance, tumbling, dodging tight hazards",
    group: "body",
  },
  {
    id: "stealth",
    name: "Stealth",
    ability: "DEX",
    scope: "Moving unseen through streets and structures",
    group: "body",
  },
  {
    id: "sleight-of-hand",
    name: "Sleight of Hand",
    ability: "DEX",
    scope: "Palming gear, planting tags, quick swaps",
    group: "body",
  },
  {
    id: "survival",
    name: "Survival",
    ability: "WIS",
    scope: "Ruins, weather, tracking, foraging",
    group: "body",
  },
  {
    id: "endurance",
    name: "Endurance",
    ability: "CON",
    scope: "Fatigue, toxins, harsh conditions",
    group: "body",
  },
  {
    id: "close-combat",
    name: "Close Combat",
    ability: "STR",
    scope: "All melee weapons",
    group: "combat",
  },
  {
    id: "firearms",
    name: "Firearms",
    ability: "DEX",
    scope: "Pistols, rifles, SMGs, shotguns",
    group: "combat",
  },
  {
    id: "heavy-weapons",
    name: "Heavy Weapons",
    ability: "STR",
    scope: "Machine guns, launchers",
    group: "combat",
  },
  {
    id: "hacking",
    name: "Hacking",
    ability: "INT",
    scope: "Breaching networks and secured systems",
    group: "tech",
  },
  {
    id: "electronics",
    name: "Electronics",
    ability: "INT",
    scope: "Circuits, sensors, comms hardware",
    group: "tech",
  },
  {
    id: "engineering",
    name: "Engineering",
    ability: "INT",
    scope: "Structures, infrastructure, fabrication",
    group: "tech",
  },
  {
    id: "cybertech",
    name: "Cybertech",
    ability: "INT",
    scope: "Implants, neuralware, wetware tuning",
    group: "tech",
  },
  {
    id: "demolitions",
    name: "Demolitions",
    ability: "INT",
    scope: "Charges, breaching, controlled collapse",
    group: "tech",
  },
  {
    id: "drone-control",
    name: "Drone Control",
    ability: "DEX",
    scope: "Piloting and commanding remote rigs",
    group: "tech",
  },
  {
    id: "mechanics",
    name: "Mechanics",
    ability: "INT",
    scope: "Vehicles, weapons, field repair",
    group: "tech",
  },
  {
    id: "persuasion",
    name: "Persuasion",
    ability: "CHA",
    scope: "Winning trust and cooperation",
    group: "presence",
  },
  {
    id: "deception",
    name: "Deception",
    ability: "CHA",
    scope: "Lies, bluffs, false identities",
    group: "presence",
  },
  {
    id: "intimidation",
    name: "Intimidation",
    ability: "CHA",
    scope: "Pressure, threats, fear leverage",
    group: "presence",
  },
  {
    id: "negotiation",
    name: "Negotiation",
    ability: "CHA",
    scope: "Deals, contracts, hostage talk",
    group: "presence",
  },
  {
    id: "performance",
    name: "Performance",
    ability: "CHA",
    scope: "Stagecraft, distraction, public face",
    group: "presence",
  },
  {
    id: "leadership",
    name: "Leadership",
    ability: "CHA",
    scope: "Command, morale, squad coordination",
    group: "presence",
  },
  {
    id: "streetwise",
    name: "Streetwise",
    ability: "WIS",
    scope: "Fixers, gangs, black markets",
    group: "presence",
  },
  {
    id: "etiquette",
    name: "Etiquette",
    ability: "CHA",
    scope: "Corporate, faction, and high-society codes",
    group: "presence",
  },
];

const SKILL_BY_ID = new Map(SKILLS.map((skill) => [skill.id, skill]));

const LEGACY_SKILL_ALIASES: Record<string, SkillId> = {
  arcana: "cybertech",
  nature: "survival",
  religion: "etiquette",
  medicine: "cybertech",
  crafting: "mechanics",
};

const SKILL_NAME_TO_ID = new Map(
  SKILLS.flatMap((skill) => [
    [skill.name.toLowerCase(), skill.id],
    [skill.id, skill.id],
  ]),
);

export function getSkillById(id: SkillId): SkillDefinition | undefined {
  return SKILL_BY_ID.get(id);
}

export function getSkillsByGroup(group: SkillGroupId): SkillDefinition[] {
  return SKILLS.filter((skill) => skill.group === group);
}

export function resolveSkillId(name: string): SkillId | null {
  const normalized = name.trim().toLowerCase();
  return (
    SKILL_NAME_TO_ID.get(normalized) ??
    LEGACY_SKILL_ALIASES[normalized] ??
    null
  );
}

export function parseClassSkillBonus(
  bonus: string,
): { skillId: SkillId; value: number } | null {
  const match = bonus.match(/^\+(\d+)\s+(.+)$/i);
  if (!match) return null;

  const value = Number(match[1]);
  const skillId = resolveSkillId(match[2]);
  if (!skillId || Number.isNaN(value)) return null;

  return { skillId, value };
}

/** Pathfinder-style trained class skill bonus at level 1. */
export const CLASS_SKILL_TRAINING_BONUS = 3;

export function buildClassSkillBonusMap(
  bonusLines: string[],
): Partial<Record<SkillId, number>> {
  const totals: Partial<Record<SkillId, number>> = {};

  for (const line of bonusLines) {
    const parsed = parseClassSkillBonus(line);
    if (!parsed) continue;
    totals[parsed.skillId] = CLASS_SKILL_TRAINING_BONUS;
  }

  return totals;
}

export const SKILL_GROUP_ORDER: SkillGroupId[] = [
  "body",
  "combat",
  "tech",
  "presence",
];
