import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CharacterSheetReadout from "../components/CharacterSheetReadout";
import { useAuth } from "../hooks/useAuth";
import { redirectToLogin } from "../lib/auth-routes";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import { CITY_PATH } from "../lib/city-config";
import {
  formatGenderLabel,
  formatHeight,
} from "../lib/avatar-draft";
import { clearShopAvatar, getShopAvatarId } from "../lib/magic-shop-session";
import {
  avatarDeleteConfirmationMatches,
  deleteOperatorAvatar,
  fetchOperatorAvatars,
  getAvatarClassLabel,
  getAvatarDeleteConfirmationText,
  getAvatarDisplayName,
  getAvatarIdentificationNumber,
  getAvatarSpeciesLabel,
  getOperatorAvatar,
  setActiveAvatarId,
  type OperatorAvatar,
} from "../lib/operator-avatars";
import {
  createEmptyAbilityScores,
  getSpeciesAbilityModifiers,
} from "../lib/avatar-stats";
import "./ProfileAvatarPage.css";

export default function ProfileAvatarPage() {
  const navigate = useNavigate();
  const { avatarId } = useParams<{ avatarId: string }>();
  const { user, loading } = useAuth();
  const [avatar, setAvatar] = useState<OperatorAvatar | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteConfirmationPhrase = useMemo(
    () => (avatar ? getAvatarDeleteConfirmationText(avatar) : ""),
    [avatar],
  );
  const deleteConfirmed = avatar
    ? avatarDeleteConfirmationMatches(deleteConfirmText, avatar)
    : false;

  const operatorLabel = useMemo(() => {
    return (
      user?.user_metadata?.username ??
      user?.email?.split("@")[0] ??
      "UNKNOWN"
    ).toUpperCase();
  }, [user]);

  useEffect(() => {
    if (loading) return;

    if (!user || !avatarId) {
      redirectToLogin(
        navigate,
        avatarId ? `/profile/avatars/${avatarId}` : PROFILE_PATH,
      );
      return;
    }

    let cancelled = false;
    setPageLoading(true);

    fetchOperatorAvatars(user.id)
      .then(() => {
        if (cancelled) return;
        const found = getOperatorAvatar(user.id, avatarId);
        if (!found) {
          navigate(PROFILE_PATH, { replace: true });
          return;
        }
        setAvatar(found);
        setActiveAvatarId(user.id, found.id);
      })
      .catch(() => {
        if (!cancelled) navigate(PROFILE_PATH, { replace: true });
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [avatarId, loading, navigate, user]);

  useEffect(() => {
    if (!deleteOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) {
        event.preventDefault();
        setDeleteOpen(false);
        setDeleteConfirmText("");
        setDeleteError(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteOpen, deleting]);

  function closeDeleteDialog() {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteConfirmText("");
    setDeleteError(null);
  }

  async function handleDeleteCharacter() {
    if (!user || !avatar || !deleteConfirmed || deleting) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteOperatorAvatar(user.id, avatar.id);
      if (getShopAvatarId() === avatar.id) {
        clearShopAvatar();
      }
      navigate(PROFILE_PATH, { replace: true });
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete character.",
      );
      setDeleting(false);
    }
  }

  if (loading || pageLoading || !avatar) {
    return (
      <div className="profileAvatarPage">
        <div className="profileAvatarPage__bg" />
        <div className="profileAvatarPage__loading">LOADING CHARACTER RECORD...</div>
      </div>
    );
  }

  const stats = avatar.stats ?? createEmptyAbilityScores();
  const heightLabel = formatHeight(avatar.heightFt ?? null, avatar.heightIn ?? null);
  const weightLabel =
    avatar.weightLb != null ? `${avatar.weightLb} lbs` : null;

  return (
    <div className="profileAvatarPage">
      <div className="profileAvatarPage__bg" />
      <div className="profileAvatarPage__scanlines" />
      <div className="profileAvatarPage__vignette" />

      <div className="profileAvatarPage__hud profileAvatarPage__hud--tl">
        <span>MODULE</span>
        <span className="profileAvatarPage__hudVal">CHARACTER-FILE</span>
      </div>
      <div className="profileAvatarPage__hud profileAvatarPage__hud--tr">
        <span>OPERATOR</span>
        <span className="profileAvatarPage__hudVal profileAvatarPage__hudVal--accent">
          {operatorLabel}
        </span>
      </div>

      <main className="profileAvatarPage__main">
        <div className="profileAvatarPage__toolbar">
          <div className="profileAvatarPage__toolbarMeta">
            <p className="profileAvatarPage__eyebrow">
              SLOT {String(avatar.slotIndex + 1).padStart(2, "0")}
            </p>
            <button
              type="button"
              className="profileAvatarPage__purgeBtn"
              onClick={() => setDeleteOpen(true)}
            >
              PURGE RECORD
            </button>
          </div>

          <div className="profileAvatarPage__actions">
            <button
              type="button"
              className="profileAvatarPage__backBtn"
              onClick={() => navigate(PROFILE_PATH)}
            >
              <span className="profileAvatarPage__backCursor">◀</span>
              OPERATOR FILE
            </button>

            <button
              type="button"
              className="profileAvatarPage__continueBtn"
              onClick={() => navigate(CITY_PATH)}
            >
              <span className="profileAvatarPage__continueCursor">▶</span>
              ENTER CYRENE
            </button>
          </div>
        </div>

        <div className="profileAvatarPage__sheetWrap">
          <CharacterSheetReadout
            variant="landscape"
            characterName={getAvatarDisplayName(avatar)}
            lineageLabel={getAvatarSpeciesLabel(avatar)}
            classLabel={getAvatarClassLabel(avatar)}
            classId={avatar.classId}
            subclassId={avatar.subclassId}
            genderLabel={formatGenderLabel(avatar.gender, avatar.genderOther)}
            operatorLabel={operatorLabel}
            identificationNumber={getAvatarIdentificationNumber(avatar)}
            stats={stats}
            speciesModifiers={getSpeciesAbilityModifiers(
              avatar.speciesId,
              avatar.subspeciesId,
            )}
            age={avatar.age}
            heightLabel={heightLabel !== "—" ? heightLabel : null}
            weightLabel={weightLabel}
          />
        </div>
      </main>

      {deleteOpen ? (
        <div
          className="profileAvatarPage__deleteOverlay"
          role="presentation"
          onClick={closeDeleteDialog}
        >
          <section
            className="profileAvatarPage__deleteDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profileAvatarDeleteTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profileAvatarPage__deleteHeader">
              <span className="profileAvatarPage__deleteDot" />
              <div>
                <p className="profileAvatarPage__deleteEyebrow">IRREVERSIBLE</p>
                <h2
                  id="profileAvatarDeleteTitle"
                  className="profileAvatarPage__deleteTitle"
                >
                  PURGE CHARACTER RECORD
                </h2>
              </div>
            </div>

            <div className="profileAvatarPage__deleteBody">
              <p className="profileAvatarPage__deleteLead">
                This permanently removes{" "}
                <strong>{deleteConfirmationPhrase}</strong> from your operator
                file. Stats, imprint ID, and slot assignment cannot be recovered.
              </p>
              <label className="profileAvatarPage__deleteLabel" htmlFor="profileAvatarDeleteConfirm">
                Type the character name to confirm
              </label>
              <input
                id="profileAvatarDeleteConfirm"
                className="profileAvatarPage__deleteInput"
                type="text"
                value={deleteConfirmText}
                autoComplete="off"
                spellCheck={false}
                disabled={deleting}
                placeholder={deleteConfirmationPhrase}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
              />
              <p className="profileAvatarPage__deleteHint">
                Enter <span>{deleteConfirmationPhrase}</span> exactly (case
                insensitive).
              </p>
              {deleteError ? (
                <p className="profileAvatarPage__deleteError">{deleteError}</p>
              ) : null}
            </div>

            <div className="profileAvatarPage__deleteFooter">
              <button
                type="button"
                className="profileAvatarPage__deleteCancelBtn"
                disabled={deleting}
                onClick={closeDeleteDialog}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="profileAvatarPage__deleteConfirmBtn"
                disabled={!deleteConfirmed || deleting}
                onClick={() => void handleDeleteCharacter()}
              >
                {deleting ? "PURGING..." : "PURGE RECORD"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
