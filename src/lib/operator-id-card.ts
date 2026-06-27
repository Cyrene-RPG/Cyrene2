import { formatClassLabel } from "../data/classes";
import { getSpeciesById } from "../data/species";
import { getSubspeciesById } from "../data/subspecies";
import {
  formatCharacterName,
  formatGenderLabel,
  formatHeight,
  validateIdentity,
  type AvatarDraft,
} from "./avatar-draft";
import { formatOperatorIdentificationNumber } from "./avatar-stats";

export type OperatorIdFieldTone = "pending" | "live" | "default";

export type OperatorIdDetailField = {
  label: string;
  value: string;
  tone: OperatorIdFieldTone;
  wide?: boolean;
};

export type OperatorIdCardView = {
  identificationNumber: string;
  identificationTone: OperatorIdFieldTone;
  permitClass: string;
  nameLine: string;
  nameTone: OperatorIdFieldTone;
  detailFields: OperatorIdDetailField[];
  stamp: string;
  stampTone: OperatorIdFieldTone;
  issueLabel: string;
  expiryLabel: string;
  mrzLine: string;
  footerLabel: string;
  showQuestionMarks: boolean;
  initials: string;
};



function buildMrz(identificationNumber: string, nameLine: string) {
  const idPart =
    identificationNumber === "PENDING"
      ? "PENDING"
      : identificationNumber.replace(/-/g, "");
  const namePart = nameLine.replace(/[^A-Z0-9]/gi, "<").slice(0, 18);
  return `CYR<<OPERATOR<<${idPart}<<${namePart}`;
}

export function buildOperatorIdCard(draft: AvatarDraft): OperatorIdCardView {
  const species = draft.speciesId ? getSpeciesById(draft.speciesId) : undefined;
  const subspecies = draft.subspeciesId
    ? getSubspeciesById(draft.subspeciesId)
    : undefined;

  const hasName = formatCharacterName(draft.displayName, draft.lastName) !== "—";
  const hasPartialName = Boolean(
    draft.displayName.trim() || draft.lastName.trim(),
  );

  const nameLine =
    hasName || hasPartialName
      ? formatCharacterName(draft.displayName, draft.lastName).toUpperCase()
      : "UNREGISTERED OPERATOR";

  const speciesValue = species
    ? subspecies
      ? `${species.name} / ${subspecies.name}`
      : species.name
    : "PENDING";

  const roleValue = draft.classId
    ? formatClassLabel(draft.classId, draft.subclassId)
    : "UNASSIGNED";

  const heightValue = formatHeight(draft.heightFt, draft.heightIn);
  const { value: rollBasedId, complete: idComplete } =
    formatOperatorIdentificationNumber(draft.statDiceRolls);
  const identificationNumber =
    idComplete && draft.resolvedIdentificationNumber
      ? draft.resolvedIdentificationNumber
      : rollBasedId;
  const identificationTone: OperatorIdFieldTone = idComplete
    ? "live"
    : identificationNumber === "PENDING"
      ? "pending"
      : "default";
  const genderValue = formatGenderLabel(draft.gender, draft.genderOther);

  let statusValue = "UNRESOLVED";
  let statusTone: OperatorIdFieldTone = "pending";
  let stamp = "PROV";
  let stampTone: OperatorIdFieldTone = "pending";
  let issueLabel = "ISS PROVISIONAL";
  let expiryLabel = "EXP IMPRINT";
  let footerLabel = "NOT VALID FOR CITY ACCESS";

  if (draft.stats) {
    statusValue = "CLEARED";
    statusTone = "live";
    stamp = "AUTH";
    stampTone = "live";
    issueLabel = "ISS ACTIVE";
    expiryLabel = "EXP REVIEW";
    footerLabel = "VALID IN CYRENE METRO";
  } else if (draft.classId) {
    statusValue = "STATS OPEN";
    statusTone = "default";
    stamp = "ROLE";
    stampTone = "default";
    issueLabel = "ISS PENDING";
    expiryLabel = "EXP IMPRINT";
    footerLabel = "ABILITIES INCOMPLETE";
  } else if (validateIdentity(draft).valid) {
    statusValue = "ID LOCKED";
    statusTone = "live";
    stamp = "BIO";
    stampTone = "live";
    issueLabel = "ISS PENDING";
    expiryLabel = "EXP IMPRINT";
    footerLabel = "AWAITING ROLE ASSIGNMENT";
  } else if (hasPartialName || draft.gender || draft.age != null) {
    statusValue = "IMPRINTING";
    statusTone = "default";
    stamp = "PENDING";
    stampTone = "default";
    issueLabel = "ISS PROVISIONAL";
    expiryLabel = "EXP IMPRINT";
    footerLabel = "IDENTITY IN PROGRESS";
  } else if (species) {
    statusValue = subspecies ? "LINEAGE OK" : "SPECIES OK";
    statusTone = "live";
    stamp = "LINEAGE";
    stampTone = "live";
    issueLabel = "ISS PROVISIONAL";
    expiryLabel = "EXP IMPRINT";
    footerLabel = "AWAITING BIOMETRICS";
  }

  const weightValue =
    draft.weightLb != null ? `${draft.weightLb} LB` : "—";

  return {
    identificationNumber,
    identificationTone,
    permitClass: roleValue.toUpperCase(),
    nameLine,
    nameTone: hasName ? "live" : hasPartialName ? "default" : "pending",
    detailFields: [
      {
        label: "SPECIES",
        value: speciesValue.toUpperCase(),
        tone: species ? "live" : "pending",
        wide: true,
      },
      {
        label: "HT",
        value: heightValue === "—" ? "—" : heightValue.toUpperCase(),
        tone: heightValue === "—" ? "pending" : "live",
      },
      {
        label: "WT",
        value: weightValue === "—" ? "—" : weightValue.toUpperCase(),
        tone: draft.weightLb != null ? "live" : "pending",
      },
      {
        label: "AGE",
        value: draft.age != null ? String(draft.age) : "—",
        tone: draft.age != null ? "live" : "pending",
      },
      {
        label: "SEX",
        value: genderValue === "—" ? "—" : genderValue.toUpperCase(),
        tone: genderValue === "—" ? "pending" : "live",
      },
      {
        label: "STATUS",
        value: statusValue,
        tone: statusTone,
        wide: true,
      },
    ],
    stamp,
    stampTone,
    issueLabel,
    expiryLabel,
    mrzLine: buildMrz(identificationNumber, nameLine),
    footerLabel,
    showQuestionMarks: !hasPartialName,
    initials: (() => {
      const first = draft.displayName.trim()[0] ?? "";
      const last = draft.lastName.trim()[0] ?? "";
      const code = `${first}${last}`.toUpperCase();
      return code || first.toUpperCase() || "OP";
    })(),
  };
}
