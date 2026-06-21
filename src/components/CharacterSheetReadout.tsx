import {
  ABILITIES,
  ABILITY_LABELS,
  formatAbilityModifier,
  type Ability,
  type AbilityScores,
} from "../lib/avatar-stats";
import "./CharacterSheetReadout.css";

export type CharacterSheetReadoutProps = {
  characterName: string;
  lineageLabel: string;
  classLabel: string;
  genderLabel: string;
  operatorLabel: string;
  stats: AbilityScores;
  speciesModifiers?: Partial<AbilityScores>;
  age?: number | null;
  heightLabel?: string | null;
  weightLabel?: string | null;
};

function formatSpeciesMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export default function CharacterSheetReadout({
  characterName,
  lineageLabel,
  classLabel,
  genderLabel,
  operatorLabel,
  stats,
  speciesModifiers = {},
  age,
  heightLabel,
  weightLabel,
}: CharacterSheetReadoutProps) {
  const hasPhysique = age != null || heightLabel || weightLabel;

  return (
    <div className="pfSheet" aria-label="Character record">
      <header className="pfSheet__banner">
        <div className="pfSheet__bannerMain">
          <span className="pfSheet__bannerEyebrow">Cyrene RPG</span>
          <h2 className="pfSheet__bannerTitle">Character Record</h2>
        </div>
        <div className="pfSheet__bannerMark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>

      <section className="pfSheet__panel pfSheet__panel--identity">
        <div className="pfSheet__field pfSheet__field--name">
          <span className="pfSheet__fieldLabel">Character Name</span>
          <span className="pfSheet__fieldValue">{characterName}</span>
        </div>
        <div className="pfSheet__field">
          <span className="pfSheet__fieldLabel">Class</span>
          <span className="pfSheet__fieldValue">{classLabel}</span>
        </div>
        <div className="pfSheet__field">
          <span className="pfSheet__fieldLabel">Race / Lineage</span>
          <span className="pfSheet__fieldValue">{lineageLabel}</span>
        </div>
        <div className="pfSheet__field">
          <span className="pfSheet__fieldLabel">Gender</span>
          <span className="pfSheet__fieldValue">{genderLabel}</span>
        </div>
        <div className="pfSheet__field">
          <span className="pfSheet__fieldLabel">Operator</span>
          <span className="pfSheet__fieldValue">{operatorLabel}</span>
        </div>
      </section>

      {hasPhysique ? (
        <section className="pfSheet__panel pfSheet__panel--physique">
          {age != null ? (
            <div className="pfSheet__miniField">
              <span className="pfSheet__miniLabel">Age</span>
              <span className="pfSheet__miniValue">{age}</span>
            </div>
          ) : null}
          {heightLabel ? (
            <div className="pfSheet__miniField">
              <span className="pfSheet__miniLabel">Height</span>
              <span className="pfSheet__miniValue">{heightLabel}</span>
            </div>
          ) : null}
          {weightLabel ? (
            <div className="pfSheet__miniField">
              <span className="pfSheet__miniLabel">Weight</span>
              <span className="pfSheet__miniValue">{weightLabel}</span>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="pfSheet__panel pfSheet__panel--abilities">
        <div className="pfSheet__sectionHead">
          <span className="pfSheet__sectionTitle">Ability Scores</span>
          <span className="pfSheet__sectionHint">Score · Modifier</span>
        </div>

        <div className="pfSheet__abilityRow">
          {ABILITIES.map((ability: Ability) => {
            const racialMod = speciesModifiers[ability] ?? 0;

            return (
              <div className="pfSheet__abilityBlock" key={ability}>
                <span className="pfSheet__abilityAbbr">{ability}</span>
                <span className="pfSheet__abilityName">
                  {ABILITY_LABELS[ability]}
                </span>
                <div className="pfSheet__abilityScoreBox">
                  <span className="pfSheet__abilityScore">{stats[ability]}</span>
                </div>
                <div className="pfSheet__abilityModBox">
                  <span className="pfSheet__abilityMod">
                    {formatAbilityModifier(stats[ability])}
                  </span>
                </div>
                {racialMod !== 0 ? (
                  <span className="pfSheet__abilityRacial">
                    {formatSpeciesMod(racialMod)} racial
                  </span>
                ) : (
                  <span className="pfSheet__abilityRacial pfSheet__abilityRacial--empty">
                    —
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="pfSheet__footer">
        <span>4d6, drop lowest · keep highest three</span>
        <span>Modifiers follow Pathfinder rules</span>
      </footer>
    </div>
  );
}
