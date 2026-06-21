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
import type { AbilityScores } from "./avatar-stats";
import { hasCompleteAbilityScores } from "./avatar-stats";
import { SPECIES } from "../data/species";
import { getSubspeciesById } from "../data/subspecies";
import { supabase } from "./supabase";

export const MAX_AVATAR_SLOTS = 3;

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
) {
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
  id = crypto.randomUUID(),
  createdAt = new Date().toISOString(),
): OperatorAvatar {
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

  if (!supabase) {
    const avatar = draftToAvatar(userId, draft, slotIndex);
    writeAll(userId, [...existing, avatar]);
    return avatar;
  }

  const { data, error } = await supabase
    .from("operator_avatars")
    .insert(draftToInsertRow(userId, draft, slotIndex))
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const saved = rowToAvatar(data as OperatorAvatarRow);
  writeAll(userId, [...existing, saved]);
  return saved;
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
    const avatar = draftToAvatar(userId, draft, slotIndex);
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
