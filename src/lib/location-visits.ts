const STORAGE_PREFIX = "cyrene_location_visits_";
const SCENE_PREFIX = "cyrene_location_scenes_";

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function sceneStorageKey(userId: string): string {
  return `${SCENE_PREFIX}${userId}`;
}

function readVisits(userId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function readScenes(userId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(sceneStorageKey(userId));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeVisits(userId: string, visits: Record<string, boolean>) {
  localStorage.setItem(storageKey(userId), JSON.stringify(visits));
}

function writeScenes(userId: string, scenes: Record<string, string>) {
  localStorage.setItem(sceneStorageKey(userId), JSON.stringify(scenes));
}

/** True after the player has chosen Enter on the exterior screen at least once. */
export function hasEnteredLocation(userId: string, locationId: string): boolean {
  return readVisits(userId)[locationId] === true;
}

export function markLocationEntered(userId: string, locationId: string) {
  const visits = readVisits(userId);
  visits[locationId] = true;
  writeVisits(userId, visits);
}

/** Last in-location scene (e.g. gate-nine lobby vs desk). */
export function getLocationScene(
  userId: string,
  locationId: string,
): string | null {
  return readScenes(userId)[locationId] ?? null;
}

export function setLocationScene(
  userId: string,
  locationId: string,
  scene: string,
) {
  const scenes = readScenes(userId);
  scenes[locationId] = scene;
  writeScenes(userId, scenes);
}
