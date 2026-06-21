import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MagicShopShell from "../components/MagicShopShell";
import {
  AVATAR_SELECT_LINE,
  MAGIC_SHOP_BROWSE_PATH,
  MAGIC_SHOP_PATH,
} from "../data/magic-shop";
import { isAvatarForgePaused, PROFILE_PATH } from "../lib/avatar-forge-config";
import { setShopAvatarId } from "../lib/magic-shop-session";
import {
  fetchOperatorAvatars,
  getAvatarDisplayName,
  getAvatarInitial,
  getAvatarSpeciesLabel,
  MAX_AVATAR_SLOTS,
  type OperatorAvatar,
} from "../lib/operator-avatars";
import { useAuth } from "../hooks/useAuth";
import { useTypewriter } from "../hooks/useTypewriter";
import {
  useVashirPortrait,
  VASHIR_PORTRAIT_HEIGHT,
  VASHIR_PORTRAIT_WIDTH,
} from "../hooks/useVashirPortrait";
import "./MagicShopPage.css";

export default function MagicShopAvatarSelectPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const portraitSrc = useVashirPortrait();
  const { displayedText, isTyping } = useTypewriter(AVATAR_SELECT_LINE);
  const [avatars, setAvatars] = useState<OperatorAvatar[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const operatorName =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "TRAVELER";

  useEffect(() => {
    if (!loading && !user) {
      navigate(MAGIC_SHOP_PATH, { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    fetchOperatorAvatars(user.id)
      .then((owned) => {
        if (cancelled) return;
        setAvatars(owned);
        if (owned.length === 1) {
          setSelectedId(owned[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setAvatars([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleEnterShop() {
    if (!selectedId) return;
    setShopAvatarId(selectedId);
    navigate(MAGIC_SHOP_BROWSE_PATH);
  }

  const canShop = Boolean(selectedId) && !isTyping;
  const forgePaused = isAvatarForgePaused();

  return (
    <MagicShopShell status="SELECT AVATAR" operatorName={operatorName}>
      <div className="magicShop__scene magicShop__scene--select">
        <div className="shopSelect">
          <div className="shopSelect__merchant">
            <div className="shopInterior__portrait">
              {portraitSrc && (
                <img
                  className="shopInterior__portraitImg"
                  src={portraitSrc}
                  alt="Va'shir"
                  width={VASHIR_PORTRAIT_WIDTH}
                  height={VASHIR_PORTRAIT_HEIGHT}
                  decoding="sync"
                />
              )}
            </div>

            <div className="shopInterior__dialogue">
              <div className="magicShop__dialogueHeader">
                <span className="magicShop__dot" />
                VA&apos;SHIR
              </div>
              <p className="magicShop__dialogueLine">
                {displayedText}
                {isTyping && <span className="magicShop__cursor">|</span>}
              </p>
            </div>
          </div>

          <section
            className={`shopSelect__panel${isTyping ? " shopSelect__panel--waiting" : ""}`}
          >
            <header className="shopSelect__header">
              <div>
                <p className="shopSelect__eyebrow">VESSEL UPLINK</p>
                <h2 className="shopSelect__title">CHOOSE YOUR AVATAR</h2>
              </div>
              <p className="shopSelect__hint">
                {avatars.length === 0
                  ? "NO FORGED AVATARS DETECTED"
                  : `${avatars.length} / ${MAX_AVATAR_SLOTS} SLOTS FILLED`}
              </p>
            </header>

            {avatars.length === 0 ? (
              <div className="shopSelect__empty">
                <p>
                  Va&apos;shir sells to bodies, not operators. Forge an avatar
                  first, then return when a vessel is ready to carry your
                  purchases.
                </p>
                {!forgePaused ? (
                  <button
                    type="button"
                    className="magicShop__action magicShop__action--ghost"
                    onClick={() => navigate("/avatar-forge")}
                  >
                    OPEN AVATAR FORGE
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="shopSelect__grid">
                {avatars.map((avatar) => {
                  const isSelected = selectedId === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      className={`shopSelect__card${isSelected ? " shopSelect__card--selected" : ""}`}
                      onClick={() => setSelectedId(avatar.id)}
                    >
                      <span className="shopSelect__cardGlyph" aria-hidden>
                        {getAvatarInitial(avatar)}
                      </span>
                      <span className="shopSelect__cardBody">
                        <span className="shopSelect__cardSlot">
                          SLOT {String(avatar.slotIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="shopSelect__cardName">
                          {getAvatarDisplayName(avatar)}
                        </span>
                        <span className="shopSelect__cardSpecies">
                          {getAvatarSpeciesLabel(avatar)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="shopSelect__actions">
              <button
                type="button"
                className="magicShop__action magicShop__action--ghost"
                onClick={() => navigate(MAGIC_SHOP_PATH)}
              >
                ◀ BACK TO ENTRANCE
              </button>
              <button
                type="button"
                className="magicShop__action magicShop__action--ghost"
                onClick={() => navigate(PROFILE_PATH)}
              >
                RETURN TO PROFILE
              </button>
              <button
                type="button"
                className="magicShop__action magicShop__action--primary"
                disabled={!canShop}
                onClick={handleEnterShop}
              >
                ENTER SHOP
              </button>
            </div>
          </section>
        </div>
      </div>
    </MagicShopShell>
  );
}
