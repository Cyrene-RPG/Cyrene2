const DRAFT_KEY = "cyrene_avatar_draft";

import type { AbilityScores } from "./avatar-stats";

export const AVATAR_GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "other", label: "Other" },
] as const;

export type AvatarGender = (typeof AVATAR_GENDERS)[number]["value"];

export type AvatarDraft = {
  speciesId: string | null;
  subspeciesId: string | null;
  displayName: string;
  lastName: string;
  gender: AvatarGender | null;
  genderOther: string;
  classId: string | null;
  subclassId: string | null;
  stats: AbilityScores | null;
  age: number | null;
  weightLb: number | null;
  heightFt: number | null;
  heightIn: number | null;
};

const defaultDraft: AvatarDraft = {
  speciesId: null,
  subspeciesId: null,
  displayName: "",
  lastName: "",
  gender: null,
  genderOther: "",
  classId: null,
  subclassId: null,
  stats: null,
  age: null,
  weightLb: null,
  heightFt: null,
  heightIn: null,
};

function migrateLegacyDraft(
  parsed: Record<string, unknown>,
): Partial<AvatarDraft> {
  const patch: Partial<AvatarDraft> = {};

  if (parsed.weightLb == null && parsed.weightKg != null) {
    const kg = Number(parsed.weightKg);
    if (!Number.isNaN(kg)) {
      patch.weightLb = Math.round(kg * 2.20462);
    }
  }

  if (
    parsed.heightFt == null &&
    parsed.heightIn == null &&
    parsed.heightCm != null
  ) {
    const cm = Number(parsed.heightCm);
    if (!Number.isNaN(cm)) {
      const totalIn = Math.round(cm / 2.54);
      patch.heightFt = Math.floor(totalIn / 12);
      patch.heightIn = totalIn % 12;
    }
  }

  return patch;
}

export function loadAvatarDraft(): AvatarDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...defaultDraft };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return { ...defaultDraft, ...parsed, ...migrateLegacyDraft(parsed) };
  } catch {
    return { ...defaultDraft };
  }
}

export function saveAvatarDraft(patch: Partial<AvatarDraft>) {
  const next = { ...loadAvatarDraft(), ...patch };
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  return next;
}

export function clearAvatarDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

const NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9' -]{1,23}$/;

export type IdentityField =
  | "displayName"
  | "lastName"
  | "gender"
  | "genderOther"
  | "age"
  | "weightLb"
  | "heightFt"
  | "heightIn";

export type IdentityValidation = {
  valid: boolean;
  errors: Partial<Record<IdentityField, string>>;
};

export function formatHeight(ft: number | null, inches: number | null): string {
  if (ft == null || inches == null) return "—";
  return `${ft}'${inches}"`;
}

export function formatCharacterName(first: string, last: string): string {
  const trimmedFirst = first.trim();
  const trimmedLast = last.trim();
  if (!trimmedFirst && !trimmedLast) return "—";
  if (!trimmedFirst) return trimmedLast;
  if (!trimmedLast) return trimmedFirst;
  return `${trimmedFirst} ${trimmedLast}`;
}

export function formatGenderLabel(
  gender: AvatarGender | null | undefined,
  genderOther?: string | null,
): string {
  if (!gender) return "—";
  if (gender === "other") {
    const trimmed = genderOther?.trim();
    return trimmed || "Other";
  }
  return AVATAR_GENDERS.find((entry) => entry.value === gender)?.label ?? "—";
}

function isAvatarGender(value: unknown): value is AvatarGender {
  return AVATAR_GENDERS.some((entry) => entry.value === value);
}

function validateNameField(
  value: string,
  emptyMessage: string,
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return emptyMessage;
  if (!NAME_PATTERN.test(trimmed)) {
    return "2–24 characters. Letters, numbers, spaces, hyphens, apostrophes.";
  }
  return undefined;
}

export function validateIdentity(draft: Pick<
  AvatarDraft,
  | "displayName"
  | "lastName"
  | "gender"
  | "genderOther"
  | "age"
  | "weightLb"
  | "heightFt"
  | "heightIn"
>): IdentityValidation {
  const errors: Partial<Record<IdentityField, string>> = {};

  const firstNameError = validateNameField(
    draft.displayName,
    "Enter your character's first name.",
  );
  if (firstNameError) errors.displayName = firstNameError;

  const lastNameError = validateNameField(
    draft.lastName,
    "Enter your character's last name.",
  );
  if (lastNameError) errors.lastName = lastNameError;

  if (!draft.gender || !isAvatarGender(draft.gender)) {
    errors.gender = "Select a gender.";
  } else if (draft.gender === "other") {
    const otherError = validateNameField(
      draft.genderOther,
      "Describe your character's gender.",
    );
    if (otherError) errors.genderOther = otherError;
  }

  if (draft.age == null || Number.isNaN(draft.age)) {
    errors.age = "Enter age in years.";
  } else if (draft.age < 16 || draft.age > 500) {
    errors.age = "Age must be between 16 and 500.";
  }

  if (draft.weightLb == null || Number.isNaN(draft.weightLb)) {
    errors.weightLb = "Enter weight in lbs.";
  } else if (draft.weightLb < 66 || draft.weightLb > 660) {
    errors.weightLb = "Weight must be between 66 and 660 lbs.";
  }

  if (draft.heightFt == null || Number.isNaN(draft.heightFt)) {
    errors.heightFt = "Enter height in feet.";
  } else if (draft.heightFt < 3 || draft.heightFt > 8) {
    errors.heightFt = "Feet must be between 3 and 8.";
  }

  if (draft.heightIn == null || Number.isNaN(draft.heightIn)) {
    errors.heightIn = "Enter remaining inches.";
  } else if (draft.heightIn < 0 || draft.heightIn > 11) {
    errors.heightIn = "Inches must be between 0 and 11.";
  }

  if (
    draft.heightFt != null &&
    draft.heightIn != null &&
    !errors.heightFt &&
    !errors.heightIn
  ) {
    const totalIn = draft.heightFt * 12 + draft.heightIn;
    if (totalIn < 39 || totalIn > 98) {
      errors.heightIn = "Height must be between 3'3\" and 8'2\".";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
