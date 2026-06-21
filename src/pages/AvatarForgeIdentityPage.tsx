import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UnknownFigure from "../components/UnknownFigure";
import {
  AvatarForgePageHeader,
  AvatarForgePanelHeader,
  AvatarForgeShell,
  useAvatarForgeHud,
} from "../components/AvatarForgeShell";
import { getSpeciesById } from "../data/species";
import { getSubspeciesById, speciesHasSubspecies } from "../data/subspecies";
import { useAuth } from "../hooks/useAuth";
import {
  getIdentityBackLabel,
  getIdentityBackRoute,
} from "../lib/avatar-forge-nav";
import {
  AVATAR_GENDERS,
  formatCharacterName,
  formatGenderLabel,
  formatHeight,
  loadAvatarDraft,
  saveAvatarDraft,
  type AvatarGender,
  validateIdentity,
} from "../lib/avatar-draft";
import "./AvatarForgePage.css";

const TUTORIAL_MESSAGE =
  "Now imprint your identity onto the avatar shell. Set your name, gender, age, weight, and height — the city reads you through these parameters.";

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export default function AvatarForgeIdentityPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const initialDraft = loadAvatarDraft();
  const parentSpecies = initialDraft.speciesId
    ? getSpeciesById(initialDraft.speciesId)
    : undefined;
  const parentSubspecies = initialDraft.subspeciesId
    ? getSubspeciesById(initialDraft.subspeciesId)
    : undefined;

  const [charIndex, setCharIndex] = useState(0);
  const [messageDone, setMessageDone] = useState(false);
  const [displayName, setDisplayName] = useState(initialDraft.displayName);
  const [lastName, setLastName] = useState(initialDraft.lastName);
  const [gender, setGender] = useState<AvatarGender | null>(initialDraft.gender);
  const [genderOther, setGenderOther] = useState(initialDraft.genderOther);
  const [ageInput, setAgeInput] = useState(
    initialDraft.age != null ? String(initialDraft.age) : "",
  );
  const [weightInput, setWeightInput] = useState(
    initialDraft.weightLb != null ? String(initialDraft.weightLb) : "",
  );
  const [heightFtInput, setHeightFtInput] = useState(
    initialDraft.heightFt != null ? String(initialDraft.heightFt) : "",
  );
  const [heightInInput, setHeightInInput] = useState(
    initialDraft.heightIn != null ? String(initialDraft.heightIn) : "",
  );
  const [touched, setTouched] = useState(false);

  const displayedMessage = TUTORIAL_MESSAGE.slice(0, charIndex);
  const isTyping = charIndex < TUTORIAL_MESSAGE.length;

  const draftSnapshot = useMemo(
    () => ({
      displayName,
      lastName,
      gender,
      genderOther,
      age: parseOptionalInt(ageInput),
      weightLb: parseOptionalInt(weightInput),
      heightFt: parseOptionalInt(heightFtInput),
      heightIn: parseOptionalInt(heightInInput),
    }),
    [displayName, lastName, gender, genderOther, ageInput, weightInput, heightFtInput, heightInInput],
  );

  const validation = useMemo(
    () => validateIdentity(draftSnapshot),
    [draftSnapshot],
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const draft = loadAvatarDraft();
    if (!draft.speciesId) {
      navigate("/avatar-forge", { replace: true });
      return;
    }
    if (speciesHasSubspecies(draft.speciesId) && !draft.subspeciesId) {
      navigate("/avatar-forge/subspecies", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (charIndex >= TUTORIAL_MESSAGE.length) {
      const timer = window.setTimeout(() => setMessageDone(true), 400);
      return () => clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setCharIndex((c) => c + 1), 28);
    return () => clearTimeout(timer);
  }, [charIndex]);

  function persistIdentity() {
    saveAvatarDraft(draftSnapshot);
  }

  function handleBack() {
    navigate(getIdentityBackRoute(loadAvatarDraft()));
  }

  function handleContinue() {
    setTouched(true);
    if (!validation.valid) return;
    saveAvatarDraft(draftSnapshot);
    navigate("/avatar-forge/class", { replace: true });
  }

  const username =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "UNKNOWN";

  const lineageLabel = parentSubspecies
    ? `${parentSpecies?.name ?? "Species"} / ${parentSubspecies.name}`
    : (parentSpecies?.name ?? "Species");

  const backLabel = getIdentityBackLabel(loadAvatarDraft());

  const { figureVariant, prompt, panelClass } = useAvatarForgeHud();

  return (
    <AvatarForgeShell
      username={username}
      stepLabel="03 / IDENTITY"
      metaLabel="LINEAGE"
      metaValue={lineageLabel.toUpperCase()}
    >
      <main className="avatarForge__main">
        <AvatarForgePageHeader
          eyebrow="BIOMETRIC IMPRINT"
          title="AVATAR FORGE"
          subtitle="Define how your avatar appears in Cyrene"
          personalEyebrow="BIOMETRIC IMPRINT"
          personalSubtitle="Define how you appear in Cyrene"
        />

        <div className="avatarForge__stage">
          <div className="avatarForge__figureWrap">
            <UnknownFigure variant={figureVariant} />
          </div>

          <div className={`avatarForge__panel${panelClass}`}>
            <AvatarForgePanelHeader />

            <div className="avatarForge__message">
              <p className="avatarForge__messageLine">
                <span className="avatarForge__prompt">{prompt}</span>
                {displayedMessage}
                {isTyping && <span className="avatarForge__cursor">|</span>}
              </p>
            </div>

            <div
              className={`avatarForge__speciesSection ${messageDone ? "avatarForge__speciesSection--ready" : ""}`}
            >
              <div className="avatarForge__speciesHeader">
                SET IDENTITY PARAMETERS
              </div>

              <div className="avatarForge__workArea">
                <form
                  className="avatarForge__form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleContinue();
                  }}
                >
                  <label className="avatarForge__field">
                    <span className="avatarForge__fieldLabel">First name</span>
                    <input
                      className={`avatarForge__input ${touched && validation.errors.displayName ? "avatarForge__input--error" : ""}`}
                      type="text"
                      value={displayName}
                      maxLength={24}
                      autoComplete="off"
                      placeholder="Enter first name"
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        saveAvatarDraft({ displayName: e.target.value });
                      }}
                      onBlur={() => {
                        setTouched(true);
                        persistIdentity();
                      }}
                    />
                    {touched && validation.errors.displayName ? (
                      <span className="avatarForge__fieldError">
                        {validation.errors.displayName}
                      </span>
                    ) : null}
                  </label>

                  <label className="avatarForge__field">
                    <span className="avatarForge__fieldLabel">Last name</span>
                    <input
                      className={`avatarForge__input ${touched && validation.errors.lastName ? "avatarForge__input--error" : ""}`}
                      type="text"
                      value={lastName}
                      maxLength={24}
                      autoComplete="off"
                      placeholder="Enter last name"
                      onChange={(e) => {
                        setLastName(e.target.value);
                        saveAvatarDraft({ lastName: e.target.value });
                      }}
                      onBlur={() => {
                        setTouched(true);
                        persistIdentity();
                      }}
                    />
                    {touched && validation.errors.lastName ? (
                      <span className="avatarForge__fieldError">
                        {validation.errors.lastName}
                      </span>
                    ) : null}
                  </label>

                  <label className="avatarForge__field">
                    <span className="avatarForge__fieldLabel">Gender</span>
                    <select
                      className={`avatarForge__input avatarForge__select ${touched && validation.errors.gender ? "avatarForge__input--error" : ""}`}
                      value={gender ?? ""}
                      onChange={(e) => {
                        const nextGender = e.target.value
                          ? (e.target.value as AvatarGender)
                          : null;
                        setGender(nextGender);
                        if (nextGender !== "other") {
                          setGenderOther("");
                          saveAvatarDraft({ gender: nextGender, genderOther: "" });
                          return;
                        }
                        saveAvatarDraft({ gender: nextGender });
                      }}
                      onBlur={() => {
                        setTouched(true);
                        persistIdentity();
                      }}
                    >
                      <option value="">Select gender</option>
                      {AVATAR_GENDERS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {touched && validation.errors.gender ? (
                      <span className="avatarForge__fieldError">
                        {validation.errors.gender}
                      </span>
                    ) : null}
                  </label>

                  {gender === "other" ? (
                    <label className="avatarForge__field">
                      <span className="avatarForge__fieldLabel">
                        Specify gender
                      </span>
                      <input
                        className={`avatarForge__input ${touched && validation.errors.genderOther ? "avatarForge__input--error" : ""}`}
                        type="text"
                        value={genderOther}
                        maxLength={24}
                        autoComplete="off"
                        placeholder="Enter your gender"
                        onChange={(e) => {
                          setGenderOther(e.target.value);
                          saveAvatarDraft({ genderOther: e.target.value });
                        }}
                        onBlur={() => {
                          setTouched(true);
                          persistIdentity();
                        }}
                      />
                      {touched && validation.errors.genderOther ? (
                        <span className="avatarForge__fieldError">
                          {validation.errors.genderOther}
                        </span>
                      ) : null}
                    </label>
                  ) : null}

                  <label className="avatarForge__field">
                    <span className="avatarForge__fieldLabel">Age (years)</span>
                    <input
                      className={`avatarForge__input ${touched && validation.errors.age ? "avatarForge__input--error" : ""}`}
                      type="number"
                      min={16}
                      max={500}
                      inputMode="numeric"
                      value={ageInput}
                      placeholder="e.g. 24"
                      onChange={(e) => {
                        setAgeInput(e.target.value);
                        saveAvatarDraft({ age: parseOptionalInt(e.target.value) });
                      }}
                      onBlur={() => {
                        setTouched(true);
                        persistIdentity();
                      }}
                    />
                    {touched && validation.errors.age ? (
                      <span className="avatarForge__fieldError">
                        {validation.errors.age}
                      </span>
                    ) : null}
                  </label>

                  <label className="avatarForge__field">
                    <span className="avatarForge__fieldLabel">Weight (lbs)</span>
                    <input
                      className={`avatarForge__input ${touched && validation.errors.weightLb ? "avatarForge__input--error" : ""}`}
                      type="number"
                      min={66}
                      max={660}
                      inputMode="numeric"
                      value={weightInput}
                      placeholder="e.g. 160"
                      onChange={(e) => {
                        setWeightInput(e.target.value);
                        saveAvatarDraft({
                          weightLb: parseOptionalInt(e.target.value),
                        });
                      }}
                      onBlur={() => {
                        setTouched(true);
                        persistIdentity();
                      }}
                    />
                    {touched && validation.errors.weightLb ? (
                      <span className="avatarForge__fieldError">
                        {validation.errors.weightLb}
                      </span>
                    ) : null}
                  </label>

                  <div className="avatarForge__field">
                    <span className="avatarForge__fieldLabel">Height</span>
                    <div className="avatarForge__heightRow">
                      <label className="avatarForge__heightField">
                        <span className="avatarForge__heightUnit">ft</span>
                        <input
                          className={`avatarForge__input ${touched && validation.errors.heightFt ? "avatarForge__input--error" : ""}`}
                          type="number"
                          min={3}
                          max={8}
                          inputMode="numeric"
                          value={heightFtInput}
                          placeholder="5"
                          onChange={(e) => {
                            setHeightFtInput(e.target.value);
                            saveAvatarDraft({
                              heightFt: parseOptionalInt(e.target.value),
                            });
                          }}
                          onBlur={() => {
                            setTouched(true);
                            persistIdentity();
                          }}
                        />
                      </label>
                      <label className="avatarForge__heightField">
                        <span className="avatarForge__heightUnit">in</span>
                        <input
                          className={`avatarForge__input ${touched && validation.errors.heightIn ? "avatarForge__input--error" : ""}`}
                          type="number"
                          min={0}
                          max={11}
                          inputMode="numeric"
                          value={heightInInput}
                          placeholder="10"
                          onChange={(e) => {
                            setHeightInInput(e.target.value);
                            saveAvatarDraft({
                              heightIn: parseOptionalInt(e.target.value),
                            });
                          }}
                          onBlur={() => {
                            setTouched(true);
                            persistIdentity();
                          }}
                        />
                      </label>
                    </div>
                    {touched && (validation.errors.heightFt || validation.errors.heightIn) ? (
                      <span className="avatarForge__fieldError">
                        {validation.errors.heightFt ?? validation.errors.heightIn}
                      </span>
                    ) : null}
                  </div>
                </form>

                <div className="avatarForge__detail avatarForge__detail--readout">
                  <div className="avatarForge__detailName">LIVE READOUT</div>
                  <div className="avatarForge__readout">
                    <div className="avatarForge__readoutRow">
                      <span className="avatarForge__readoutKey">Name</span>
                      <span className="avatarForge__readoutVal">
                        {formatCharacterName(displayName, lastName)}
                      </span>
                    </div>
                    <div className="avatarForge__readoutRow">
                      <span className="avatarForge__readoutKey">Gender</span>
                      <span className="avatarForge__readoutVal">
                        {formatGenderLabel(
                          draftSnapshot.gender,
                          draftSnapshot.genderOther,
                        )}
                      </span>
                    </div>
                    <div className="avatarForge__readoutRow">
                      <span className="avatarForge__readoutKey">Age</span>
                      <span className="avatarForge__readoutVal">
                        {draftSnapshot.age != null
                          ? `${draftSnapshot.age} yrs`
                          : "—"}
                      </span>
                    </div>
                    <div className="avatarForge__readoutRow">
                      <span className="avatarForge__readoutKey">Weight</span>
                      <span className="avatarForge__readoutVal">
                        {draftSnapshot.weightLb != null
                          ? `${draftSnapshot.weightLb} lbs`
                          : "—"}
                      </span>
                    </div>
                    <div className="avatarForge__readoutRow">
                      <span className="avatarForge__readoutKey">Height</span>
                      <span className="avatarForge__readoutVal">
                        {formatHeight(
                          draftSnapshot.heightFt,
                          draftSnapshot.heightIn,
                        )}
                      </span>
                    </div>
                    <div className="avatarForge__readoutRow">
                      <span className="avatarForge__readoutKey">Species</span>
                      <span className="avatarForge__readoutVal">
                        {parentSpecies?.name ?? "—"}
                      </span>
                    </div>
                    {parentSubspecies ? (
                      <div className="avatarForge__readoutRow">
                        <span className="avatarForge__readoutKey">
                          Subspecies
                        </span>
                        <span className="avatarForge__readoutVal">
                          {parentSubspecies.name}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="avatarForge__actions">
              <button
                type="button"
                className="avatarForge__backBtn"
                onClick={handleBack}
              >
                <span className="avatarForge__backCursor">◀</span>
                {backLabel}
              </button>

              <button
                type="button"
                className="avatarForge__continue"
                disabled={!validation.valid}
                onClick={handleContinue}
              >
                <span className="avatarForge__continueCursor">▶</span>
                CONFIRM IDENTITY
              </button>
            </div>
          </div>
        </div>
      </main>
    </AvatarForgeShell>
  );
}
