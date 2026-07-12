import { WELCOME_MISSION_PATH } from "../lib/city-config";

export type MissionCheckpoint = {
  id: string;
  label: string;
  summary: string;
};

export type MissionDefinition = {
  id: string;
  title: string;
  path: string;
  startCheckpointId: string;
  checkpoints: Record<string, MissionCheckpoint>;
};

export const WELCOME_MISSION: MissionDefinition = {
  id: "welcome",
  title: "Welcome to Cyrene",
  path: WELCOME_MISSION_PATH,
  startCheckpointId: "ferry_deck",
  checkpoints: {
    ferry_deck: {
      id: "ferry_deck",
      label: "Ferry deck",
      summary:
        "The ferry hums toward the island skyline. A stranger leans on the rail as Cyrene rises from the haze.",
    },
    elf_watch: {
      id: "elf_watch",
      label: "The stranger at the rail",
      summary:
        "You studied the elf by the railing — coiled, watchful, aware of you without turning.",
    },
    nymph_race: {
      id: "nymph_race",
      label: "Racing the ferry",
      summary:
        "Water nymphs darted through the wake, laughed, and vanished beneath the waves.",
    },
    surveying: {
      id: "surveying",
      label: "Surveying the deck",
      summary:
        "You took in the deck and the approaching city as the ferry pushed onward.",
    },
  },
};

export const MISSION_REGISTRY: Record<string, MissionDefinition> = {
  welcome: WELCOME_MISSION,
};

export function getMissionById(missionId: string): MissionDefinition | null {
  return MISSION_REGISTRY[missionId] ?? null;
}

export function getMissionCheckpoint(
  missionId: string,
  checkpointId: string,
): MissionCheckpoint | null {
  const mission = getMissionById(missionId);
  if (!mission) return null;
  return mission.checkpoints[checkpointId] ?? null;
}
