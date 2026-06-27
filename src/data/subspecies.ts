export type Subspecies = {
  id: string;
  parentSpeciesId: string;
  name: string;
  tagline: string;
  description: string;
  bonuses: string[];
  disadvantages: string[];
};

export const SUBSPECIES: Subspecies[] = [
  // Elf
  {
    id: "ice-elf",
    parentSpeciesId: "elf",
    name: "Ice Elf",
    tagline: "Cold-resistant intellect",
    description:
      "Elves adapted to frozen climates and arcane study. Their minds stay sharp under pressure and magical strain.",
    bonuses: ["+1 Intelligence", "+1 Wisdom"],
    disadvantages: ["Less physical durability than warrior elven lines"],
  },
  {
    id: "amazonian-elf",
    parentSpeciesId: "elf",
    name: "Amazonian Elf",
    tagline: "Agile warriors",
    description:
      "A martial elven line built for speed, presence, and battlefield awareness in Cyrene's outer districts.",
    bonuses: ["+1 Wisdom", "+1 Charisma"],
    disadvantages: ["Less specialized for deep arcane research"],
  },
  // Dwarves — clans
  {
    id: "mahurki",
    parentSpeciesId: "dwarves",
    name: "Mahurki Clan",
    tagline: "Weaponsmith legacy",
    description:
      "Dedicated weaponsmiths whose forged arms are among the most sought after in Cyrene.",
    bonuses: ["+1 Crafting", "+1 Weapons Proficiency"],
    disadvantages: ["Clan reputation ties you to warcraft factions"],
  },
  {
    id: "denaturi",
    parentSpeciesId: "dwarves",
    name: "Denaturi",
    tagline: "Alchemical mastery",
    description:
      "Masters of alchemy producing the highest quality potions — and the illegal substance known as Raze.",
    bonuses: ["+1 Crafting", "+1 Poison/Toxin Resistance"],
    disadvantages: ["Associated with black-market alchemical trade"],
  },
  {
    id: "fenratali",
    parentSpeciesId: "dwarves",
    name: "Fenratali",
    tagline: "Armor & augmentation",
    description:
      "Specialists in armor and cybernetic crafting, often employed by ANCR or SYNAPSE.",
    bonuses: ["+1 Armor Crafting", "Access to Cybernetic Modifications"],
    disadvantages: ["Black-market armor ties draw corporate attention"],
  },
  // Cambions — origins
  {
    id: "demon-born",
    parentSpeciesId: "cambions",
    name: "Demon-Born",
    tagline: "Infernal union",
    description:
      "Born of direct union between demon and human. The most stable cambion line, with power that develops consistently.",
    bonuses: ["+1 Fire Resistance", "+1 Charisma", "Otherworldly allure"],
    disadvantages: ["Holy and radiant magic hits harder"],
  },
  {
    id: "cursed",
    parentSpeciesId: "cambions",
    name: "Cursed",
    tagline: "Forced transformation",
    description:
      "Transformed by external magic — spells, artifacts, or unstable environments. Power runs hot and unpredictable.",
    bonuses: ["+2 Magic", "Volatile surges of infernal force"],
    disadvantages: ["-1 Constitution", "Unstable ability manifestation"],
  },
  {
    id: "pact-made",
    parentSpeciesId: "cambions",
    name: "Pact-Made",
    tagline: "Patron's mark",
    description:
      "Power granted through infernal agreement. The body adapts over time, marked by a visible patron sigil.",
    bonuses: ["+1 Strength", "+2 Magic (chosen attribute)", "Patron sigil"],
    disadvantages: ["Bound to patron expectations and faction scrutiny"],
  },
  // Dragonborn — variants (codex)
  {
    id: "drake",
    parentSpeciesId: "dragonborn",
    name: "Drake",
    tagline: "Armored bulk",
    description:
      "Heavily built with layered scales like natural armor. Breath weapons span fire, acid, lightning, or frost.",
    bonuses: ["Elemental breath (varied)", "Layered natural armor"],
    disadvantages: ["Large frame — poor stealth profile"],
  },
  {
    id: "wyrm",
    parentSpeciesId: "dragonborn",
    name: "Wyrm",
    tagline: "Serpent aggression",
    description:
      "The most serpent-like dragonborn — sinuous, hooded, and often poison or fire breath.",
    bonuses: ["Poison or fire breath", "Serpent agility"],
    disadvantages: ["Aggressive temperament — social friction"],
  },
  {
    id: "leviathan",
    parentSpeciesId: "dragonborn",
    name: "Leviathan",
    tagline: "Deep water kin",
    description:
      "Eel-like bodies attuned to water. Breathe submerged; on land wield water or lightning breath.",
    bonuses: ["Aquatic breathing", "Water/Lightning breath"],
    disadvantages: ["Less effective in arid environments"],
  },
  {
    id: "basilisk",
    parentSpeciesId: "dragonborn",
    name: "Basilisk",
    tagline: "Desert gaze",
    description:
      "Stocky desert kin with paralyzing mist breath. Some bear the dreaded stone-gaze.",
    bonuses: ["Vibration sense (100ft)", "Paralyzing mist breath"],
    disadvantages: ["Stone-gaze must be controlled (lenses/blindfolds)"],
  },
  {
    id: "kilin",
    parentSpeciesId: "dragonborn",
    name: "Kilin",
    tagline: "Calming aura",
    description:
      "Fine scales, antler-like horns, hooved feet. Their breath soothes rather than destroys.",
    bonuses: ["Calming aura", "Subtle breath effects"],
    disadvantages: ["Less raw combat power than drake lines"],
  },
  {
    id: "asian",
    parentSpeciesId: "dragonborn",
    name: "Imperial",
    tagline: "Celestial serpent",
    description:
      "Serpentine imperial dragonborn with golden scales, frills, and lightning breath.",
    bonuses: ["Keen darkvision", "Lightning breath"],
    disadvantages: ["Distinct appearance draws attention in Cyrene"],
  },
  {
    id: "faerie",
    parentSpeciesId: "dragonborn",
    name: "Faerie",
    tagline: "Fey-touched small",
    description:
      "The smallest dragonborn — lithe, vivid, silver-tongued, with dazzling fire breath.",
    bonuses: ["+1 Charisma", "Small stature (stealth edge)", "Fire breath"],
    disadvantages: ["Reduced physical reach and carry capacity"],
  },
  // Hybrid
  {
    id: "half-elf",
    parentSpeciesId: "hybrid",
    name: "Half Elf",
    tagline: "Dual bloodline",
    description:
      "Human adaptability blended with elven arcane sensitivity. Caught between two worlds.",
    bonuses: ["+1 Dexterity", "+1 Charisma", "Flexible stat allocation"],
    disadvantages: ["Identity questioned by purist factions"],
  },
  {
    id: "half-orc",
    parentSpeciesId: "hybrid",
    name: "Half Orc",
    tagline: "Conflict forged",
    description:
      "Human resilience merged with orcish force. Built for survival in hostile districts.",
    bonuses: ["+1 Strength", "+1 Constitution"],
    disadvantages: ["Social prejudice in upper city sectors"],
  },
];

const SUBSPECIES_PARENTS = new Set(
  SUBSPECIES.map((s) => s.parentSpeciesId),
);

export function speciesHasSubspecies(speciesId: string): boolean {
  return SUBSPECIES_PARENTS.has(speciesId);
}

export function getSubspeciesForSpecies(speciesId: string): Subspecies[] {
  return SUBSPECIES.filter((s) => s.parentSpeciesId === speciesId);
}

export function getSubspeciesById(id: string): Subspecies | undefined {
  return SUBSPECIES.find((s) => s.id === id);
}
