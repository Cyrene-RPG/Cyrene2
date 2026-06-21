export type Species = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bonuses: string[];
  disadvantages: string[];
};

export const SPECIES: Species[] = [
  {
    id: "human",
    name: "Human",
    tagline: "Adaptive survivors",
    description:
      "The most widespread species in Cyrene. Humans compensate for a lack of raw biological edge with flexibility, ingenuity, and cultural adaptation.",
    bonuses: ["+3 stat points to distribute freely"],
    disadvantages: [
      "No built-in physical or magical edge",
      "Must rely on allocation and training to stay competitive",
    ],
  },
  {
    id: "elf",
    name: "Elf",
    tagline: "Arcane attunement",
    description:
      "Elven neurology responds sharply to magical fields. Lean builds, elongated features, and heightened awareness define their presence in the city.",
    bonuses: ["+2 Dexterity", "+1 Intelligence", "Advantage on magic-related checks"],
    disadvantages: [
      "Lower baseline durability than hardened species",
      "Subspecies further define your exact strengths",
    ],
  },
  {
    id: "dwarves",
    name: "Dwarves",
    tagline: "Forged endurance",
    description:
      "Compact, durable, and engineered for survival in hostile environments. Dwarves excel where others break under pressure.",
    bonuses: ["+1 Strength", "+1 Constitution", "+1 Intelligence"],
    disadvantages: [
      "Reduced mobility compared to agile species",
      "Less suited to stealth and finesse builds",
    ],
  },
  {
    id: "cambions",
    name: "Cambions",
    tagline: "Demonic bloodline",
    description:
      "Born of infernal heritage. Cambions carry unnatural resilience and a presence that unsettles both allies and enemies.",
    bonuses: ["+1 Constitution", "+1 Strength", "+1 Wisdom", "+1 Intelligence"],
    disadvantages: [
      "Social stigma in certain districts of Cyrene",
      "Volatile reputation can affect faction interactions",
    ],
  },
  {
    id: "orcs",
    name: "Orcs",
    tagline: "Savage fighters",
    description:
      "Built for conflict. Orcs dominate close combat and intimidation, trading refinement for overwhelming physical force.",
    bonuses: ["+2 Strength"],
    disadvantages: [
      "Limited finesse and arcane aptitude",
      "Often targeted or underestimated by rival factions",
    ],
  },
  {
    id: "dragonborn",
    name: "Dragonborn",
    tagline: "Dragon descendants",
    description:
      "Scaled inheritors of draconic legacy. Dragonborn project power through sheer physical presence and elemental ancestry.",
    bonuses: ["+2 Strength", "+2 Constitution"],
    disadvantages: [
      "Large frame draws attention in stealth scenarios",
      "Elemental affinity locked by subspecies later",
    ],
  },
  {
    id: "hybrid",
    name: "Hybrid",
    tagline: "Mixed heritage",
    description:
      "A fusion of two bloodlines — neither fully one nor the other. Hybrids inherit a fractured but potent combination of traits.",
    bonuses: ["Bonuses vary by blend (Half Elf, Half Orc, etc.)"],
    disadvantages: [
      "Identity often questioned by purist factions",
      "Subspecies choice required on a later screen",
    ],
  },
];

export function getSpeciesById(id: string): Species | undefined {
  return SPECIES.find((s) => s.id === id);
}
