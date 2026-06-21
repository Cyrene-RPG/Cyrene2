import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MagicShopShell from "../components/MagicShopShell";
import {
  MAGIC_SHOP_PATH,
  MAGIC_SHOP_SELECT_AVATAR_PATH,
  SHOP_CATALOG,
  SHOP_RESPONSES,
  type ShopItem,
} from "../data/magic-shop";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import {
  clearShopAvatar,
  loadShopAvatar,
} from "../lib/magic-shop-session";
import {
  getAvatarDisplayName,
  getAvatarSpeciesLabel,
} from "../lib/operator-avatars";
import { useAuth } from "../hooks/useAuth";
import { useTypewriter } from "../hooks/useTypewriter";
import {
  useVashirPortrait,
  VASHIR_PORTRAIT_HEIGHT,
  VASHIR_PORTRAIT_WIDTH,
} from "../hooks/useVashirPortrait";
import "./MagicShopPage.css";

function itemGlyph(tag: ShopItem["tag"]) {
  switch (tag) {
    case "Potion":
      return "◈";
    case "Charm":
      return "✦";
    default:
      return "◆";
  }
}

function formatCredits(amount: number) {
  return `${amount.toLocaleString()} CR`;
}

export default function MagicShopInteriorPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const portraitSrc = useVashirPortrait();
  const { displayedText, isTyping } = useTypewriter(SHOP_RESPONSES.browse);

  const operatorName =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "TRAVELER";

  const shoppingAvatar =
    user && !loading ? loadShopAvatar(user.id) : null;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(MAGIC_SHOP_PATH, { replace: true });
      return;
    }
    if (!shoppingAvatar) {
      navigate(MAGIC_SHOP_SELECT_AVATAR_PATH, { replace: true });
    }
  }, [loading, user, shoppingAvatar, navigate]);

  if (!shoppingAvatar) {
    return null;
  }

  const shoppingAvatarName = getAvatarDisplayName(shoppingAvatar);
  const shoppingAvatarSpecies = getAvatarSpeciesLabel(shoppingAvatar);

  return (
    <MagicShopShell
      status="INSIDE"
      operatorName={operatorName}
      shoppingAvatarName={shoppingAvatarName}
      mainClassName="magicShop__main--interior"
    >
      <div className="shopInterior">
        <div className="shopInterior__merchant">
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

        <div className="shopFloor">
        <div className="shopFloor__ambient" aria-hidden />

        <header className="shopFloor__header">
          <div>
            <p className="shopFloor__eyebrow">INVENTORY UPLINK</p>
            <h1 className="shopFloor__title">VA&apos;SHIR&apos;S WARES</h1>
            <p className="shopFloor__avatarTag">
              Shopping as {shoppingAvatarName} · {shoppingAvatarSpecies}
            </p>
          </div>
          <p className="shopFloor__hint">
            {isTyping ? "SCANNING SHELVES..." : "SELECT AN ARTIFACT"}
          </p>
        </header>

        <div
          className={`shopFloor__grid${isTyping ? " shopFloor__grid--scanning" : ""}`}
        >
          {SHOP_CATALOG.map((item) => (
            <article
              key={item.id}
              className={`shopFloor__card shopFloor__card--${item.tag.toLowerCase()}`}
            >
              <span className="shopFloor__cardGlyph" aria-hidden>
                {itemGlyph(item.tag)}
              </span>
              <div className="shopFloor__cardBody">
                <div className="shopFloor__cardMeta">
                  <span className="shopFloor__cardTag">{item.tag}</span>
                  <span className="shopFloor__cardPrice">
                    {formatCredits(item.credits)}
                  </span>
                </div>
                <h2 className="shopFloor__cardName">{item.name}</h2>
                <p className="shopFloor__cardDesc">{item.description}</p>
              </div>
            </article>
          ))}
        </div>

        <nav className="shopFloor__nav">
          <button
            type="button"
            className="magicShop__action magicShop__action--ghost"
            onClick={() => {
              clearShopAvatar();
              navigate(MAGIC_SHOP_PATH);
            }}
          >
            ◀ LEAVE SHOP
          </button>
          <button
            type="button"
            className="magicShop__action magicShop__action--ghost"
            onClick={() => navigate(PROFILE_PATH)}
          >
            RETURN TO PROFILE
          </button>
        </nav>
        </div>
      </div>
    </MagicShopShell>
  );
}
