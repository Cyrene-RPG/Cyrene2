import {
  formatCharacterName,
  type AvatarDraft,
  type AvatarGender,
  validateIdentity,
} from "./avatar-draft";
import {
  classHasSubclasses,
  formatClassLabel,
} from "../data/classes";
import type { AbilityScores, StatDiceRolls } from "./avatar-stats";
import {
  formatOperatorIdentificationNumber,
  hasCompleteAbilityScores,
  resolveUniqueIdentificationNumber,
} from "./avatar-stats";
import { SPECIES } from "../data/species";
import { getSubspeciesById } from "../data/subspecies";
import { supabase } from "./supabase";
import { markHasPlayed } from "./player-progress";
import { clearAvatarMissionProgress } from "./mission-progress";

export const MAX_AVATAR_SLOTS = 3;

const ACTIVE_AVATAR_KEY = "cyrene_active_avatar_id";

export type OperatorAvatar = {
  id: string;
  userId: string;
  slotIndex: number;
  displayName: string;
  lastName: string;
  gender: AvatarGender | null;
  genderOther?: string;
  classId: string | null;
  subclassId?: string | null;
  stats?: AbilityScores;
  statDiceRolls?: StatDiceRolls;
  identificationNumber?: string;
  speciesId: string;
  subspeciesId: string | null;
  age?: number | null;
  weightLb?: number | null;
  heightFt?: number | null;
  heightIn?: number | null;
  createdAt: string;
};

type OperatorAvatarRow = {
  id: string;
  user_id: string;
  slot_index: number;
  display_name: string;
  last_name: string;
  gender: string | null;
  gender_other: string | null;
  class_id: string;
  subclass_id: string | null;
  species_id: string;
  subspecies_id: string | null;
  stats: AbilityScores;
  stat_dice_rolls: StatDiceRolls | null;
  identification_number: string | null;
  age: number | null;
  weight_lb: number | null;
  height_ft: number | null;
  height_in: number | null;
  created_at: string;
};

function storageKey(userId: string) {
  return `cyrene_operator_avatars_${userId}`;
}

function readAll(userId: string): OperatorAvatar[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OperatorAvatar[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(userId: string, avatars: OperatorAvatar[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(avatars));
}

function activeAvatarStorageKey(userId: string) {
  return `${ACTIVE_AVATAR_KEY}_${userId}`;
}

function buildIdentificationFields(
  draft: AvatarDraft,
  taken: Set<string>,
) {
  const { complete } = formatOperatorIdentificationNumber(draft.statDiceRolls);
  if (!complete || !draft.statDiceRolls) {
    return {
      statDiceRolls: draft.statDiceRolls,
      identificationNumber: null as string | null,
    };
  }

  const identificationNumber = resolveUniqueIdentificationNumber(
    draft.statDiceRolls,
    taken,
  );

  return {
    statDiceRolls: draft.statDiceRolls,
    identificationNumber,
  };
}

function collectLocalIdentificationNumbers(): Set<string> {
  const taken = new Set<string>();

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("cyrene_operator_avatars_")) continue;

    try {
      const avatars = JSON.parse(localStorage.getItem(key) ?? "[]") as OperatorAvatar[];
      if (!Array.isArray(avatars)) continue;

      for (const avatar of avatars) {
        if (avatar.identificationNumber) {
          taken.add(avatar.identificationNumber);
        }
      }
    } catch {
      continue;
    }
  }

  return taken;
}

export async function fetchTakenIdentificationNumbers(): Promise<Set<string>> {
  if (supabase) {
    const { data, error } = await supabase
      .from("operator_avatars")
      .select("identification_number")
      .not("identification_number", "is", null);

    if (error) throw new Error(error.message);

    const taken = new Set<string>();
    for (const row of data ?? []) {
      const value = (row as { identification_number: string | null })
        .identification_number;
      if (value) taken.add(value);
    }
    return taken;
  }

  return collectLocalIdentificationNumbers();
}

export async function resolveIdentificationForDraft(
  draft: AvatarDraft,
): Promise<string | null> {
  const { complete } = formatOperatorIdentificationNumber(draft.statDiceRolls);
  if (!complete || !draft.statDiceRolls) return null;

  const taken = await fetchTakenIdentificationNumbers();
  return resolveUniqueIdentificationNumber(draft.statDiceRolls, taken);
}

function rowToAvatar(row: OperatorAvatarRow): OperatorAvatar {
  return {
    id: row.id,
    userId: row.user_id,
    slotIndex: row.slot_index,
    displayName: row.display_name,
    lastName: row.last_name,
    gender: (row.gender as AvatarGender | null) ?? null,
    genderOther: row.gender_other ?? "",
    classId: row.class_id,
    subclassId: row.subclass_id,
    stats: row.stats,
    statDiceRolls: row.stat_dice_rolls ?? undefined,
    identificationNumber: row.identification_number ?? undefined,
    speciesId: row.species_id,
    subspeciesId: row.subspecies_id,
    age: row.age,
    weightLb: row.weight_lb,
    heightFt: row.height_ft,
    heightIn: row.height_in,
    createdAt: row.created_at,
  };
}

function draftToInsertRow(
  userId: string,
  draft: AvatarDraft,
  slotIndex: number,
  taken: Set<string>,
) {
  const { statDiceRolls, identificationNumber } = buildIdentificationFields(
    draft,
    taken,
  );

  return {
    user_id: userId,
    slot_index: slotIndex,
    display_name: draft.displayName.trim(),
    last_name: draft.lastName.trim(),
    gender: draft.gender,
    gender_other: draft.gender === "other" ? draft.genderOther.trim() : "",
    class_id: draft.classId!,
    subclass_id: draft.subclassId,
    species_id: draft.speciesId!,
    subspecies_id: draft.subspeciesId,
    stats: draft.stats!,
    stat_dice_rolls: statDiceRolls ?? null,
    identification_number: identificationNumber,
    age: draft.age,
    weight_lb: draft.weightLb,
    height_ft: draft.heightFt,
    height_in: draft.heightIn,
  };
}

function draftToAvatar(
  userId: string,
  draft: AvatarDraft,
  slotIndex: number,
  taken: Set<string>,
  id = crypto.randomUUID(),
  createdAt = new Date().toISOString(),
): OperatorAvatar {
  const { statDiceRolls, identificationNumber } = buildIdentificationFields(
    draft,
    taken,
  );

  return {
    id,
    userId,
    slotIndex,
    displayName: draft.displayName.trim(),
    lastName: draft.lastName.trim(),
    gender: draft.gender,
    genderOther: draft.gender === "other" ? draft.genderOther.trim() : "",
    classId: draft.classId,
    subclassId: draft.subclassId,
    stats: draft.stats ?? undefined,
    statDiceRolls,
    identificationNumber: identificationNumber ?? undefined,
    speciesId: draft.speciesId!,
    subspeciesId: draft.subspeciesId,
    age: draft.age,
    weightLb: draft.weightLb,
    heightFt: draft.heightFt,
    heightIn: draft.heightIn,
    createdAt,
  };
}

function validateDraftForSave(draft: AvatarDraft): void {
  if (!draft.speciesId || !draft.classId || !validateIdentity(draft).valid) {
    throw new Error("Avatar draft is incomplete.");
  }
  if (classHasSubclasses(draft.classId) && !draft.subclassId) {
    throw new Error("Choose a subclass for this class.");
  }
  if (!hasCompleteAbilityScores(draft.stats)) {
    throw new Error("Ability scores are incomplete.");
  }
  const { complete } = formatOperatorIdentificationNumber(draft.statDiceRolls);
  if (!complete) {
    throw new Error("Stat dice imprint is incomplete.");
  }
}

function pickNextSlotIndex(existing: OperatorAvatar[]): number {
  const usedSlots = new Set(existing.map((avatar) => avatar.slotIndex));
  for (let slotIndex = 0; slotIndex < MAX_AVATAR_SLOTS; slotIndex += 1) {
    if (!usedSlots.has(slotIndex)) return slotIndex;
  }
  throw new Error("All avatar slots are full.");
}

export function listOperatorAvatars(userId: string): OperatorAvatar[] {
  return readAll(userId).sort((a, b) => a.slotIndex - b.slotIndex);
}

export function getOperatorAvatar(
  userId: string,
  avatarId: string,
): OperatorAvatar | null {
  return readAll(userId).find((avatar) => avatar.id === avatarId) ?? null;
}

export async function fetchOperatorAvatars(
  userId: string,
): Promise<OperatorAvatar[]> {
  if (!supabase) {
    return listOperatorAvatars(userId);
  }

  const { data, error } = await supabase
    .from("operator_avatars")
    .select("*")
    .eq("user_id", userId)
    .order("slot_index", { ascending: true });

  if (error) throw new Error(error.message);

  const avatars = (data as OperatorAvatarRow[]).map(rowToAvatar);
  writeAll(userId, avatars);
  return avatars;
}

export async function saveOperatorAvatar(
  userId: string,
  draft: AvatarDraft,
): Promise<OperatorAvatar> {
  validateDraftForSave(draft);

  const existing = supabase
    ? await fetchOperatorAvatars(userId)
    : listOperatorAvatars(userId);

  if (existing.length >= MAX_AVATAR_SLOTS) {
    throw new Error("All avatar slots are full.");
  }

  const slotIndex = pickNextSlotIndex(existing);
  const taken = await fetchTakenIdentificationNumbers();
  const draftForSave = {
    ...draft,
    resolvedIdentificationNumber:
      draft.resolvedIdentificationNumber ??
      resolveUniqueIdentificationNumber(draft.statDiceRolls!, taken),
  };

  if (!supabase) {
    const avatar = draftToAvatar(userId, draftForSave, slotIndex, taken);
    writeAll(userId, [...existing, avatar]);
    setActiveAvatarId(userId, avatar.id);
    markHasPlayed();
    return avatar;
  }

  const { data, error } = await supabase
    .from("operator_avatars")
    .insert(draftToInsertRow(userId, draftForSave, slotIndex, taken))
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const saved = rowToAvatar(data as OperatorAvatarRow);
  writeAll(userId, [...existing, saved]);
  setActiveAvatarId(userId, saved.id);
  markHasPlayed();
  return saved;
}

export function setActiveAvatarId(userId: string, avatarId: string) {
  localStorage.setItem(activeAvatarStorageKey(userId), avatarId);
  localStorage.setItem(ACTIVE_AVATAR_KEY, avatarId);
}

export function clearActiveAvatarId(userId: string) {
  localStorage.removeItem(activeAvatarStorageKey(userId));
  localStorage.removeItem(ACTIVE_AVATAR_KEY);
}

export function getAvatarDeleteConfirmationText(avatar: OperatorAvatar): string {
  return getAvatarDisplayName(avatar).trim();
}

export function avatarDeleteConfirmationMatches(
  input: string,
  avatar: OperatorAvatar,
): boolean {
  const expected = getAvatarDeleteConfirmationText(avatar).toLowerCase();
  return input.trim().toLowerCase() === expected && expected.length > 0;
}

export async function deleteOperatorAvatar(
  userId: string,
  avatarId: string,
): Promise<void> {
  const existing = readAll(userId);
  const target = existing.find((avatar) => avatar.id === avatarId);
  if (!target) {
    throw new Error("Character record not found.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("operator_avatars")
      .delete()
      .eq("id", avatarId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  const remaining = existing.filter((avatar) => avatar.id !== avatarId);
  writeAll(userId, remaining);
  clearAvatarMissionProgress(avatarId);

  if (getActiveAvatarId(userId) === avatarId) {
    clearActiveAvatarId(userId);
    if (remaining.length > 0) {
      setActiveAvatarId(userId, remaining[0].id);
    }
  }
}

export function getActiveAvatarId(userId: string): string | null {
  return localStorage.getItem(activeAvatarStorageKey(userId));
}

export function getActiveOperatorAvatar(userId: string): OperatorAvatar | null {
  const avatarId = getActiveAvatarId(userId);
  if (!avatarId) return null;
  return getOperatorAvatar(userId, avatarId);
}

export function getAvatarIdentificationNumber(avatar: OperatorAvatar): string {
  if (avatar.identificationNumber) return avatar.identificationNumber;
  const { value } = formatOperatorIdentificationNumber(avatar.statDiceRolls);
  return value;
}

/** @deprecated Use saveOperatorAvatar */
export function registerOperatorAvatar(
  userId: string,
  draft: AvatarDraft,
): OperatorAvatar | null {
  try {
    validateDraftForSave(draft);
    const existing = listOperatorAvatars(userId);
    if (existing.length >= MAX_AVATAR_SLOTS) return null;
    const slotIndex = pickNextSlotIndex(existing);
    const taken = collectLocalIdentificationNumbers();
    const avatar = draftToAvatar(userId, draft, slotIndex, taken);
    writeAll(userId, [...existing, avatar]);
    return avatar;
  } catch {
    return null;
  }
}

export function getAvatarDisplayName(avatar: OperatorAvatar): string {
  return formatCharacterName(avatar.displayName, avatar.lastName);
}

export function getAvatarSpeciesLabel(avatar: OperatorAvatar): string {
  const species = SPECIES.find((entry) => entry.id === avatar.speciesId);
  const subspecies = avatar.subspeciesId
    ? getSubspeciesById(avatar.subspeciesId)
    : null;

  if (species && subspecies) return `${species.name} / ${subspecies.name}`;
  return species?.name ?? "Unknown species";
}

export function getAvatarInitial(avatar: OperatorAvatar): string {
  const name = getAvatarDisplayName(avatar);
  return name.charAt(0).toUpperCase() || "?";
}

export function getAvatarClassLabel(avatar: OperatorAvatar): string {
  return formatClassLabel(avatar.classId, avatar.subclassId);
}
