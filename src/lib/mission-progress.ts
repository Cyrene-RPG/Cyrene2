import {
  getMissionById,
  getMissionCheckpoint,
  WELCOME_MISSION,
  type MissionCheckpoint,
  type MissionDefinition,
} from "../data/missions";

const PROGRESS_KEY_PREFIX = "cyrene_mission_progress_";

export type AvatarMissionProgress = {
  missionId: string;
  checkpointId: string;
  updatedAt: string;
};

export type AvatarMissionResume = {
  mission: MissionDefinition;
  checkpoint: MissionCheckpoint;
  progress: AvatarMissionProgress;
};

function progressKey(avatarId: string) {
  return `${PROGRESS_KEY_PREFIX}${avatarId}`;
}

export function getAvatarMissionProgress(
  avatarId: string,
): AvatarMissionProgress | null {
  try {
    const raw = localStorage.getItem(progressKey(avatarId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AvatarMissionProgress;
    if (!parsed?.missionId || !parsed?.checkpointId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAvatarMissionProgress(
  avatarId: string,
  missionId: string,
  checkpointId: string,
) {
  const mission = getMissionById(missionId);
  if (!mission || !mission.checkpoints[checkpointId]) return;

  const payload: AvatarMissionProgress = {
    missionId,
    checkpointId,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(progressKey(avatarId), JSON.stringify(payload));
}

export function clearAvatarMissionProgress(avatarId: string) {
  localStorage.removeItem(progressKey(avatarId));
}

export function getAvatarMissionResume(
  avatarId: string,
): AvatarMissionResume | null {
  const progress = getAvatarMissionProgress(avatarId);
  if (!progress) return null;

  const mission = getMissionById(progress.missionId);
  const checkpoint = getMissionCheckpoint(progress.missionId, progress.checkpointId);
  if (!mission || !checkpoint) return null;

  return { mission, checkpoint, progress };
}

export function getDefaultMissionResume(): AvatarMissionResume {
  const checkpoint = WELCOME_MISSION.checkpoints[WELCOME_MISSION.startCheckpointId];

  return {
    mission: WELCOME_MISSION,
    checkpoint,
    progress: {
      missionId: WELCOME_MISSION.id,
      checkpointId: WELCOME_MISSION.startCheckpointId,
      updatedAt: new Date(0).toISOString(),
    },
  };
}

export function hasAvatarMissionProgress(avatarId: string): boolean {
  return getAvatarMissionProgress(avatarId) !== null;
}

export function resolveAvatarMissionResume(
  avatarId: string,
): AvatarMissionResume {
  return getAvatarMissionResume(avatarId) ?? getDefaultMissionResume();
}
