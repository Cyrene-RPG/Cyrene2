import { getClassBonuses } from "../data/classes";
import {
  buildClassSkillBonusMap,
  getSkillsByGroup,
  SKILL_GROUP_ORDER,
  SKILL_GROUP_LABELS,
  type SkillGroupId,
  type SkillId,
} from "../data/skills";
import {
  formatSignedModifier,
  getAbilityModifier,
  type AbilityScores,
} from "./avatar-stats";

export type SkillModifierView = {
  id: SkillId;
  name: string;
  ability: string;
  scope: string;
  modifier: number;
  modifierLabel: string;
  trainedBonus: number;
};

export type SkillGroupView = {
  id: SkillGroupId;
  label: string;
  skills: SkillModifierView[];
};

export function buildSkillGroups(
  stats: AbilityScores,
  classId?: string | null,
  subclassId?: string | null,
): SkillGroupView[] {
  const classBonuses = classId
    ? buildClassSkillBonusMap(getClassBonuses(classId, subclassId))
    : {};

  return SKILL_GROUP_ORDER.map((groupId) => ({
    id: groupId,
    label: SKILL_GROUP_LABELS[groupId],
    skills: getSkillsByGroup(groupId).map((skill) => {
      const abilityMod = getAbilityModifier(stats[skill.ability]);
      const trainedBonus = classBonuses[skill.id] ?? 0;
      const modifier = abilityMod + trainedBonus;

      return {
        id: skill.id,
        name: skill.name,
        ability: skill.ability,
        scope: skill.scope,
        modifier,
        modifierLabel: formatSignedModifier(modifier),
        trainedBonus,
      };
    }),
  }));
}
