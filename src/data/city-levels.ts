export type CityRegion = "lower" | "upper";

export type CityLocationStatus = "open" | "locked" | "story";

export type CityLocationKind =
  | "gate"
  | "service"
  | "shop"
  | "transit"
  | "lodging";

export type CityLevel = {
  id: string;
  region: CityRegion;
  levelNumber: number;
  label: string;
  shortLabel: string;
  description: string;
  available: boolean;
  lockedReason?: string;
};

export type CityLocation = {
  id: string;
  levelId: string;
  name: string;
  tagline: string;
  description: string;
  x: number;
  y: number;
  status: CityLocationStatus;
  kind: CityLocationKind;
  /** Short label on the map pin (e.g. price tier). */
  pinTagline?: string;
  href?: string;
  lockedReason?: string;
};

export const CITY_LEVELS: CityLevel[] = [
  {
    id: "lower-1",
    region: "lower",
    levelNumber: 1,
    label: "Port Quarter",
    shortLabel: "L1",
    description:
      "Street level and the manned entry gate. Guides, supplies, and the last regulated blocks before the undercity.",
    available: true,
  },
  {
    id: "lower-2",
    region: "lower",
    levelNumber: 2,
    label: "Undercity",
    shortLabel: "L2",
    description:
      "Commercial underlayers, chop shops, and black-market alleys beneath the Port.",
    available: false,
    lockedReason: "No uplink below Level 1. Story progress required.",
  },
  {
    id: "lower-3",
    region: "lower",
    levelNumber: 3,
    label: "Foundation",
    shortLabel: "L3",
    description: "Service tunnels and lost sectors. Guides strongly recommended.",
    available: false,
    lockedReason: "Sector sealed. Deeper Lower City access not yet granted.",
  },
  {
    id: "upper-1",
    region: "upper",
    levelNumber: 1,
    label: "Bridge Deck",
    shortLabel: "L1",
    description:
      "First sky-bridge network between tower midsections. Corporate decks and restricted elevators.",
    available: false,
    lockedReason: "Upper City clearance required. Complete Port authorization first.",
  },
  {
    id: "upper-2",
    region: "upper",
    levelNumber: 2,
    label: "Midtower Grid",
    shortLabel: "L2",
    description: "Office arcologies and executive residential sky-decks.",
    available: false,
    lockedReason: "Upper City uplink offline.",
  },
  {
    id: "upper-3",
    region: "upper",
    levelNumber: 3,
    label: "Spire Tier",
    shortLabel: "L3",
    description: "Elite floors, megacorp HQs, and power-broker enclaves.",
    available: false,
    lockedReason: "Upper City uplink offline.",
  },
];

const ENTRY_LOCKED =
  "Complete Entry Authorization through Welcome to Cyrene before using this service.";

export const CITY_LOCATIONS: CityLocation[] = [
  {
    id: "entry-gate",
    levelId: "lower-1",
    name: "Entry Gate",
    tagline: "City Entry Authorization",
    description:
      "Manned customs checkpoint. All arrivals are scanned, logged, and released into the Port Quarter — or turned back.",
    x: 50,
    y: 82,
    status: "story",
    kind: "gate",
    lockedReason:
      "Resume Welcome to Cyrene in Missions to pass through the gate.",
  },
  {
    id: "guide-registry",
    levelId: "lower-1",
    name: "Guide Registry",
    tagline: "Licensed escorts and fixers",
    description:
      "Hire Port guides who know the Lower City rhythms — shortcuts, dangers, and who not to stare at.",
    x: 34,
    y: 64,
    status: "locked",
    kind: "service",
    lockedReason: ENTRY_LOCKED,
  },
  {
    id: "port-supply",
    levelId: "lower-1",
    name: "Port Supply Co.",
    tagline: "Rations, medkits, basics",
    description:
      "Legal-ish provisioning for new arrivals. Commissary prices, no questions until you leave the counter.",
    x: 46,
    y: 52,
    status: "locked",
    kind: "shop",
    lockedReason: ENTRY_LOCKED,
  },
  {
    id: "gear-stall",
    levelId: "lower-1",
    name: "Gear & Tools",
    tagline: "Hardware and field kit",
    description:
      "Multi-vendor stall row — blades, comms, lockpicks, and the kind of tools that get noticed by security.",
    x: 58,
    y: 46,
    status: "locked",
    kind: "shop",
    lockedReason: ENTRY_LOCKED,
  },
  {
    id: "patch-bay",
    levelId: "lower-1",
    name: "Patch Bay",
    tagline: "Trauma care and tune-ups",
    description:
      "Street clinic and quick cyberware diagnostics. Not ANCR-grade, but fast.",
    x: 66,
    y: 60,
    status: "locked",
    kind: "service",
    lockedReason: ENTRY_LOCKED,
  },
  {
    id: "gate-nine-motel",
    levelId: "lower-1",
    name: "Gate Nine Motel",
    tagline: "Cheap — stacked bunks",
    pinTagline: "$",
    description:
      "Gate Nine Motel — wire-frame capsule stacks and bolt-holes by the ring. You get a door, a mat, and whatever noise the hall is making tonight.",
    x: 24,
    y: 36,
    status: "locked",
    kind: "lodging",
    lockedReason: ENTRY_LOCKED,
  },
  {
    id: "the-crossing",
    levelId: "lower-1",
    name: "The Crossing",
    tagline: "Medium — steady comfort",
    pinTagline: "$$",
    description:
      "The Crossing — licensed boarding rooms with working locks and sheets that get changed. Popular with ferry crews and mid-tier operators.",
    x: 31,
    y: 31,
    status: "locked",
    kind: "lodging",
    lockedReason: ENTRY_LOCKED,
  },
  {
    id: "neon-crown",
    levelId: "lower-1",
    name: "Neon Crown",
    tagline: "High — quiet suites",
    pinTagline: "$$$",
    description:
      "Neon Crown — the Port Quarter's upscale option. Sound-damped suites, private showers, and a concierge who remembers your name.",
    x: 33.5,
    y: 37,
    status: "locked",
    kind: "lodging",
    lockedReason: ENTRY_LOCKED,
  },
  {
    id: "transit-hub",
    levelId: "lower-1",
    name: "Transit Hub",
    tagline: "Lifts, freight, ferry link",
    description:
      "Elevators to Upper City decks, freight descents, and the ferry spine back out to open water.",
    x: 72,
    y: 74,
    status: "locked",
    kind: "transit",
    lockedReason: "Upper and deep Lower routes require clearance and story progress.",
  },
  {
    id: "magic-row",
    levelId: "lower-1",
    name: "Magic Row",
    tagline: "Va'shir's curio annex",
    description:
      "Unofficial edge of the Port Quarter. Curiosities, upgrades, and a shopkeeper who sells to bodies — not operators.",
    x: 80,
    y: 38,
    status: "open",
    kind: "shop",
    href: "/magic-shop",
  },
];

/** Decorative block grid hints for Lower Level 1 — not individually clickable yet. */
export const LOWER_1_BLOCKS = [
  { id: "b-a1", x: 22, y: 28, w: 14, h: 12, label: "Visitor Ring" },
  { id: "b-a2", x: 38, y: 24, w: 16, h: 14, label: "Supply Strip" },
  { id: "b-a3", x: 56, y: 22, w: 14, h: 16, label: "Service Row" },
  { id: "b-a4", x: 72, y: 26, w: 12, h: 12, label: "Annex" },
  { id: "b-b1", x: 28, y: 48, w: 18, h: 14, label: "Guide Hall" },
  { id: "b-b2", x: 48, y: 44, w: 16, h: 16, label: "Market Row" },
  { id: "b-b3", x: 66, y: 48, w: 14, h: 14, label: "Clinic Block" },
  { id: "b-c1", x: 36, y: 68, w: 28, h: 14, label: "Gate Plaza" },
  { id: "b-c2", x: 66, y: 66, w: 16, h: 16, label: "Transit" },
  { id: "b-offline-1", x: 8, y: 52, w: 12, h: 20, offline: true },
  { id: "b-offline-2", x: 86, y: 58, w: 10, h: 22, offline: true },
  { id: "b-offline-3", x: 18, y: 78, w: 10, h: 14, offline: true },
] as const;

export function getCityLevel(levelId: string): CityLevel | undefined {
  return CITY_LEVELS.find((level) => level.id === levelId);
}

export function getLocationsForLevel(levelId: string): CityLocation[] {
  return CITY_LOCATIONS.filter((location) => location.levelId === levelId);
}

export function getLocationById(locationId: string): CityLocation | undefined {
  return CITY_LOCATIONS.find((location) => location.id === locationId);
}

export function getDefaultCityLevelId(): string {
  return "lower-1";
}
