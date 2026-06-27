export const GATE_NINE_MOTEL_ID = "gate-nine-motel";

export const GATE_NINE_EXTERIOR =
  "Gate Nine Motel squats against the Visitor Ring like it was welded into place as an afterthought—three stories of rust-streaked composite panels clinging to the edge of the transit district. A flickering neon sign hangs above the entrance, its sickly green letters spelling GATE NINE, though several characters fail at random intervals and the glowing 9 blinks on and off as if struggling to stay alive.\n\nLaundry lines sag between upper-level railings, draped with work coveralls, patched cloaks, and cheap synth-fabric clothing. Through the scratched front windows, doors leading to rooms line a dim lobby where a clerk sits behind a reinforced security cage half-hidden beneath takeout cartons, cargo manifests, and forgotten packages.\n\nThe air smells of engine exhaust, fried street food, and damp metal. Ferry horns echo up from the channel below while freight haulers rumble through the neighboring docks at all hours. The walls are thin, the mattresses thinner, and privacy is something sold elsewhere.\n\nCheap. Loud. Open. For travelers short on credits and long on bad luck, Gate Nine always has a room.";

export const GATE_NINE_LOBBY =
  "You push through the front door—it sticks halfway before giving way with a wet click and a puff of warm, recycled air.\n\nThe lobby is narrow and low-ceilinged, lit by a failing strip of white LEDs and the sickly green glow bleeding through the front windows from the motel's flickering sign. The walls are stained with years of grime and hurried repairs, patched with mismatched panels that don't quite fit.\n\nNumbered doors line both sides of the hall. Their paint is chipped and faded, room numbers scrawled on strips of mismatched tape: 101, 102, 103. Several digits are peeling away at the corners, leaving it unclear whether some rooms are occupied or simply forgotten.\n\nAt the far end sits the reception desk, protected by a reinforced security cage of scratched plexiglass and metal mesh. The clerk behind it doesn't even look up. A receipt printer whines intermittently beneath piles of takeout containers, data slates, and crumpled forms. The glow of a terminal reflects off tired eyes fixed on something more interesting than arriving guests.\n\nThe worn linoleum floor sticks slightly underfoot, its once-white surface stained yellow-gray by decades of tracked-in grime, spilled drinks, and cleaning chemicals.\n\nSomewhere behind one of the doors, a shower runs continuously. From another room comes the sound of an argument carried through paper-thin walls, spoken in a language you don't recognize. Pipes rattle overhead. A ventilation fan hums with an uneven drone that suggests it should have failed years ago.\n\nThe reception desk is the only way to get a room.";

export const GATE_NINE_DESK =
  "You step up to the speak-hole in the security cage. The clerk finally glances up from a battered datapad, eyes flat and practiced—the look of someone who has already decided you're not worth the trouble.\n\n\"Room?\" he asks before you can speak. \"Rates are on the board. Pay upfront. No refunds if the ferry horn keeps you up all night.\"\n\nHe jerks a thumb toward a laminated rate card taped to the scratched plexiglass.\n\n*GATE NINE MOTEL — DAILY RATES*\n\n*Single Bunk*  — 10 credits/night\nShared bathroom. Locker included. No privacy guarantee.\n\n*Standard Room* — 20 credits/night\nSingle bed, sink, shared bathroom.\n\n*Double Room* — 30 credits/night\nTwo beds, sink, shared bathroom.\n\n*Private Washroom Upgrade* — +10 credits/night\nSubject to availability.\n\nWeekly Rate Available. Ask Clerk.\n\nHouse Rules\n• Payment upfront.\n• No fighting in hallways.\n• No discharge of weapons indoors.\n• No summoning entities larger than your room.\n• Management not responsible for theft, infestation, possession, haunting, curses, dimensional breaches, or missing luggage.\n• Checkout at 1100.\n\nThe clerk returns his attention to the datapad.\n\nThe printer spits out a receipt somewhere behind the desk. Pipes groan overhead. The argument behind one of the numbered doors has escalated into shouting.\n\n\"Well?\" he says \"You renting or blocking the line?\"";

export type GateNineRoomId = "single-bunk" | "standard" | "double";

export type GateNineRoom = {
  id: GateNineRoomId;
  name: string;
  creditsPerNight: number;
  description: string;
};

export type GateNineDurationId =
  | "1-night"
  | "2-nights"
  | "3-nights"
  | "1-week";

export type GateNineDuration = {
  id: GateNineDurationId;
  label: string;
  nights: number;
};

export const GATE_NINE_WASHROOM_UPGRADE_CREDITS = 10;

export const GATE_NINE_BOOKING_TIME_NOTE =
  "City time isn't wired yet. Nights you book here are saved to your stay record but won't advance the in-game calendar until the story clock lands — different story paths may handle time differently.";

export const GATE_NINE_ROOMS: GateNineRoom[] = [
  {
    id: "single-bunk",
    name: "Single Bunk",
    creditsPerNight: 10,
    description: "Shared bathroom. Locker included. No privacy guarantee.",
  },
  {
    id: "standard",
    name: "Standard Room",
    creditsPerNight: 20,
    description: "Single bed, sink, shared bathroom.",
  },
  {
    id: "double",
    name: "Double Room",
    creditsPerNight: 30,
    description: "Two beds, sink, shared bathroom.",
  },
];

export const GATE_NINE_DURATIONS: GateNineDuration[] = [
  { id: "1-night", label: "1 Night", nights: 1 },
  { id: "2-nights", label: "2 Nights", nights: 2 },
  { id: "3-nights", label: "3 Nights", nights: 3 },
  { id: "1-week", label: "1 Week", nights: 7 },
];

export function calcGateNineBookingTotal(
  roomId: GateNineRoomId,
  durationId: GateNineDurationId,
  washroomUpgrade: boolean,
): number {
  const room = GATE_NINE_ROOMS.find((entry) => entry.id === roomId);
  const duration = GATE_NINE_DURATIONS.find((entry) => entry.id === durationId);
  if (!room || !duration) return 0;

  let total = room.creditsPerNight * duration.nights;
  if (washroomUpgrade) {
    total += GATE_NINE_WASHROOM_UPGRADE_CREDITS * duration.nights;
  }
  return total;
}
