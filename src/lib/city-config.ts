export const CITY_PATH = "/city";
export const MISSIONS_PATH = "/missions";

/** Gate Nine Motel — map, story, and direct links. */
export const GATE_NINE_MOTEL_PATH = "/city/locations/gate-nine-motel";

export function getLocationPath(locationId: string): string {
  return `/city/locations/${locationId}`;
}

/** Legacy HTML mission content — story scenes live here until migrated. */
export const WELCOME_MISSION_PATH = "/mission1.html";
