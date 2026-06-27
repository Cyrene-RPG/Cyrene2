export type ClassSubclass = {
  id: string;
  parentClassId: string;
  name: string;
  tagline: string;
  description: string;
  bonuses: string[];
};

export type CharacterClass = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bonuses: string[];
};

export const CLASSES: CharacterClass[] = [
  {
    id: "mage",
    name: "Mage",
    tagline: "Arcane specialist",
    description:
      "Channelers of structured magic. Mages bend Cyrene's arcane currents through study, ritual, and raw will — then specialize in healing or combat casting.",
    bonuses: ["+3 Cybertech"],
  },
  {
    id: "kenzai",
    name: "Kenzai",
    tagline: "Close-combat operative",
    description:
      "Cybernetically enhanced fighters built for direct engagements. Kenzai blend martial discipline with athletic dominance, survival instinct, and digital intrusion.",
    bonuses: [
      "+3 Athletics",
      "+3 Acrobatics",
      "+3 Hacking",
      "+3 Survival",
    ],
  },
  {
    id: "bard",
    name: "Bard",
    tagline: "Social operator",
    description:
      "Performers and manipulators who weaponize presence. Bards move crowds, open doors, and read the arcane undertones others miss.",
    bonuses: ["+3 Performance", "+3 Cybertech"],
  },
  {
    id: "shaman",
    name: "Shaman",
    tagline: "Spirit broker",
    description:
      "Intermediaries between nature, faith, and the unseen. Shamans draw power from old rites and the living world around Cyrene.",
    bonuses: ["+3 Cybertech", "+3 Survival", "+3 Streetwise"],
  },
  {
    id: "assassin",
    name: "Assassin",
    tagline: "Ghost in the grid",
    description:
      "Precision predators trained for silence and sudden violence. Assassins excel at infiltration, pursuit, and lethal exits.",
    bonuses: ["+3 Stealth", "+3 Athletics", "+3 Acrobatics"],
  },
  {
    id: "rigger",
    name: "Rigger",
    tagline: "Machine whisperer",
    description:
      "Engineers of drones, rigs, and improvised hardware. Riggers keep the city's machines — and their operators — alive under fire.",
    bonuses: ["+3 Mechanics", "+3 Drone Control"],
  },
];

export const CLASS_SUBCLASSES: ClassSubclass[] = [
  {
    id: "healer",
    parentClassId: "mage",
    name: "Healer",
    tagline: "Restoration path",
    description:
      "Mages who channel magic into mending flesh, stabilizing trauma, and keeping allies upright in the worst firefights.",
    bonuses: ["+3 Cybertech"],
  },
  {
    id: "combat",
    parentClassId: "mage",
    name: "Combat",
    tagline: "War casting",
    description:
      "Mages who prioritize destructive output, battlefield control, and arcane dominance over support work.",
    bonuses: ["+3 Demolitions"],
  },
];

export function getClassById(id: string): CharacterClass | undefined {
  return CLASSES.find((entry) => entry.id === id);
}

export function classHasSubclasses(classId: string): boolean {
  return CLASS_SUBCLASSES.some((entry) => entry.parentClassId === classId);
}

export function getSubclassesForClass(classId: string): ClassSubclass[] {
  return CLASS_SUBCLASSES.filter((entry) => entry.parentClassId === classId);
}

export function getSubclassById(id: string): ClassSubclass | undefined {
  return CLASS_SUBCLASSES.find((entry) => entry.id === id);
}

export function formatClassLabel(
  classId: string | null | undefined,
  subclassId?: string | null,
): string {
  if (!classId) return "—";
  const characterClass = getClassById(classId);
  if (!characterClass) return "—";
  const subclass = subclassId ? getSubclassById(subclassId) : undefined;
  if (subclass) return `${characterClass.name} / ${subclass.name}`;
  return characterClass.name;
}

export function getClassBonuses(
  classId: string,
  subclassId?: string | null,
): string[] {
  const characterClass = getClassById(classId);
  if (!characterClass) return [];

  const bonuses = [...characterClass.bonuses];
  const subclass = subclassId ? getSubclassById(subclassId) : undefined;
  if (subclass) bonuses.push(...subclass.bonuses);
  return bonuses;
}
