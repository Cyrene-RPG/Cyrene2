import {
  ABILITIES,
  ABILITY_LABELS,
  formatAbilityModifier,
  type Ability,
  type AbilityScores,
} from "../lib/avatar-stats";
import {
  buildSkillGroups,
  type SkillGroupView,
  type SkillModifierView,
} from "../lib/skill-modifiers";
import "./CharacterSheetReadout.css";

export type CharacterSheetReadoutProps = {
  characterName: string;
  lineageLabel: string;
  classLabel: string;
  classId?: string | null;
  subclassId?: string | null;
  genderLabel: string;
  operatorLabel: string;
  identificationNumber?: string | null;
  stats: AbilityScores;
  speciesModifiers?: Partial<AbilityScores>;
  age?: number | null;
  heightLabel?: string | null;
  weightLabel?: string | null;
  variant?: "default" | "landscape";
};

function formatSpeciesMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function splitSkillColumns(skillGroups: SkillGroupView[]) {
  const allSkills = skillGroups.flatMap((group) => group.skills);
  const midpoint = Math.ceil(allSkills.length / 2);
  return {
    left: allSkills.slice(0, midpoint),
    right: allSkills.slice(midpoint),
  };
}

function SkillRow({ skill }: { skill: SkillModifierView }) {
  return (
    <div
      className={`pfSkillRow${
        skill.trainedBonus > 0 ? " pfSkillRow--trained" : ""
      }`}
      title={skill.scope}
    >
      <span
        className={`pfSkillRow__mark${
          skill.trainedBonus > 0 ? " pfSkillRow__mark--trained" : ""
        }`}
        aria-hidden="true"
      />
      <span className="pfSkillRow__name">{skill.name}</span>
      <span className="pfSkillRow__ability">{skill.ability}</span>
      <span className="pfSkillRow__total">{skill.modifierLabel}</span>
    </div>
  );
}

function AbilityScoresBlock({
  stats,
  speciesModifiers,
}: {
  stats: AbilityScores;
  speciesModifiers: Partial<AbilityScores>;
}) {
  return (
    <div className="pfAbilityRow">
      {ABILITIES.map((ability: Ability) => {
        const racialMod = speciesModifiers[ability] ?? 0;

        return (
          <div className="pfAbility" key={ability}>
            <span className="pfAbility__abbr">{ability}</span>
            <div className="pfAbility__scoreBox">
              <span className="pfAbility__score">{stats[ability]}</span>
            </div>
            <div className="pfAbility__modBox">
              <span className="pfAbility__mod">
                {formatAbilityModifier(stats[ability])}
              </span>
            </div>
            <span className="pfAbility__name">{ABILITY_LABELS[ability]}</span>
            {racialMod !== 0 ? (
              <span className="pfAbility__racial">
                {formatSpeciesMod(racialMod)} racial
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function PathfinderSpread({
  characterName,
  lineageLabel,
  classLabel,
  genderLabel,
  operatorLabel,
  showId,
  age,
  heightLabel,
  weightLabel,
  stats,
  speciesModifiers,
  skillGroups,
}: {
  characterName: string;
  lineageLabel: string;
  classLabel: string;
  genderLabel: string;
  operatorLabel: string;
  showId: string | null;
  age?: number | null;
  heightLabel?: string | null;
  weightLabel?: string | null;
  stats: AbilityScores;
  speciesModifiers: Partial<AbilityScores>;
  skillGroups: SkillGroupView[];
}) {
  const { left, right } = splitSkillColumns(skillGroups);

  return (
    <div className="pfSpread" aria-label="Character record">
      <article className="pfPage pfPage--front">
        <header className="pfPage__bar">
          <span className="pfPage__barEyebrow">Cyrene RPG</span>
          <h2 className="pfPage__barTitle">Character Record</h2>
        </header>

        <section className="pfBlock pfBlock--identity">
          <div className="pfField pfField--wide">
            <span className="pfField__label">Character Name</span>
            <span className="pfField__value pfField__value--name">
              {characterName}
            </span>
          </div>
          <div className="pfField">
            <span className="pfField__label">Class</span>
            <span className="pfField__value">{classLabel}</span>
          </div>
          <div className="pfField">
            <span className="pfField__label">Race / Lineage</span>
            <span className="pfField__value">{lineageLabel}</span>
          </div>
          <div className="pfField">
            <span className="pfField__label">Gender</span>
            <span className="pfField__value">{genderLabel}</span>
          </div>
          <div className="pfField">
            <span className="pfField__label">Operator</span>
            <span className="pfField__value">{operatorLabel}</span>
          </div>
          {showId ? (
            <div className="pfField pfField--wide">
              <span className="pfField__label">Operator ID</span>
              <span className="pfField__value pfField__value--mono">{showId}</span>
            </div>
          ) : null}
          {age != null ? (
            <div className="pfField pfField--mini">
              <span className="pfField__label">Age</span>
              <span className="pfField__value">{age}</span>
            </div>
          ) : null}
          {heightLabel ? (
            <div className="pfField pfField--mini">
              <span className="pfField__label">Height</span>
              <span className="pfField__value">{heightLabel}</span>
            </div>
          ) : null}
          {weightLabel ? (
            <div className="pfField pfField--mini">
              <span className="pfField__label">Weight</span>
              <span className="pfField__value">{weightLabel}</span>
            </div>
          ) : null}
        </section>

        <section className="pfBlock pfBlock--abilities">
          <h3 className="pfBlock__heading">Ability Scores</h3>
          <AbilityScoresBlock stats={stats} speciesModifiers={speciesModifiers} />
        </section>
      </article>

      <article className="pfPage pfPage--skills">
        <header className="pfPage__bar">
          <span className="pfPage__barEyebrow">Cyrene RPG</span>
          <h2 className="pfPage__barTitle">Skills</h2>
        </header>

        <div className="pfSkillKey">
          <span>Class Skill</span>
          <span>Skill Name</span>
          <span>Ability</span>
          <span>Total</span>
        </div>

        <div className="pfSkillColumns">
          <div className="pfSkillColumn">
            {left.map((skill) => (
              <SkillRow key={skill.id} skill={skill} />
            ))}
          </div>
          <div className="pfSkillColumn">
            {right.map((skill) => (
              <SkillRow key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

export default function CharacterSheetReadout({
  characterName,
  lineageLabel,
  classLabel,
  classId,
  subclassId,
  genderLabel,
  operatorLabel,
  identificationNumber,
  stats,
  speciesModifiers = {},
  age,
  heightLabel,
  weightLabel,
  variant = "default",
}: CharacterSheetReadoutProps) {
  const skillGroups = buildSkillGroups(stats, classId, subclassId);
  const showId =
    identificationNumber && identificationNumber !== "PENDING"
      ? identificationNumber
      : null;

  if (variant === "landscape") {
    return (
      <PathfinderSpread
        characterName={characterName}
        lineageLabel={lineageLabel}
        classLabel={classLabel}
        genderLabel={genderLabel}
        operatorLabel={operatorLabel}
        showId={showId}
        age={age}
        heightLabel={heightLabel}
        weightLabel={weightLabel}
        stats={stats}
        speciesModifiers={speciesModifiers}
        skillGroups={skillGroups}
      />
    );
  }

  const hasPhysique = age != null || heightLabel || weightLabel;
  const { left, right } = splitSkillColumns(skillGroups);

  return (
    <div className="pfSheet pfSheet--portrait" aria-label="Character record">
      <header className="pfPage__bar">
        <span className="pfPage__barEyebrow">Cyrene RPG</span>
        <h2 className="pfPage__barTitle">Character Record</h2>
      </header>

      <section className="pfBlock pfBlock--identity">
        <div className="pfField pfField--wide">
          <span className="pfField__label">Character Name</span>
          <span className="pfField__value pfField__value--name">
            {characterName}
          </span>
        </div>
        <div className="pfField">
          <span className="pfField__label">Class</span>
          <span className="pfField__value">{classLabel}</span>
        </div>
        <div className="pfField">
          <span className="pfField__label">Race / Lineage</span>
          <span className="pfField__value">{lineageLabel}</span>
        </div>
        <div className="pfField">
          <span className="pfField__label">Gender</span>
          <span className="pfField__value">{genderLabel}</span>
        </div>
        <div className="pfField">
          <span className="pfField__label">Operator</span>
          <span className="pfField__value">{operatorLabel}</span>
        </div>
        {showId ? (
          <div className="pfField pfField--wide">
            <span className="pfField__label">Operator ID</span>
            <span className="pfField__value pfField__value--mono">{showId}</span>
          </div>
        ) : null}
        {hasPhysique ? (
          <>
            {age != null ? (
              <div className="pfField pfField--mini">
                <span className="pfField__label">Age</span>
                <span className="pfField__value">{age}</span>
              </div>
            ) : null}
            {heightLabel ? (
              <div className="pfField pfField--mini">
                <span className="pfField__label">Height</span>
                <span className="pfField__value">{heightLabel}</span>
              </div>
            ) : null}
            {weightLabel ? (
              <div className="pfField pfField--mini">
                <span className="pfField__label">Weight</span>
                <span className="pfField__value">{weightLabel}</span>
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <section className="pfBlock pfBlock--abilities">
        <h3 className="pfBlock__heading">Ability Scores</h3>
        <AbilityScoresBlock stats={stats} speciesModifiers={speciesModifiers} />
      </section>

      <section className="pfBlock pfBlock--skills">
        <h3 className="pfBlock__heading">Skills</h3>
        <div className="pfSkillKey">
          <span>Class Skill</span>
          <span>Skill Name</span>
          <span>Ability</span>
          <span>Total</span>
        </div>
        <div className="pfSkillColumns pfSkillColumns--portrait">
          <div className="pfSkillColumn">
            {left.map((skill) => (
              <SkillRow key={skill.id} skill={skill} />
            ))}
          </div>
          <div className="pfSkillColumn">
            {right.map((skill) => (
              <SkillRow key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
