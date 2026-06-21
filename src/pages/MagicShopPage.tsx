import { useNavigate } from "react-router-dom";
import MagicShopShell from "../components/MagicShopShell";
import { MAGIC_SHOP_SELECT_AVATAR_PATH, OPENING_LINE } from "../data/magic-shop";
import { PROFILE_PATH } from "../lib/avatar-forge-config";
import { useAuth } from "../hooks/useAuth";
import { useTypewriter } from "../hooks/useTypewriter";
import {
  useVashirPortrait,
  VASHIR_PORTRAIT_HEIGHT,
  VASHIR_PORTRAIT_WIDTH,
} from "../hooks/useVashirPortrait";
import "./MagicShopPage.css";

export default function MagicShopPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const portraitSrc = useVashirPortrait();
  const { displayedText, isTyping } = useTypewriter(OPENING_LINE);

  const operatorName =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "TRAVELER";

  return (
    <MagicShopShell status="OPEN" operatorName={operatorName}>
      <div className="magicShop__scene">
        <div className="magicShop__compose">
          <div className="magicShop__portraitStage">
            {portraitSrc && (
              <img
                className="magicShop__portrait"
                src={portraitSrc}
                alt="Va'shir"
                width={VASHIR_PORTRAIT_WIDTH}
                height={VASHIR_PORTRAIT_HEIGHT}
                decoding="sync"
              />
            )}
          </div>

          <div className="magicShop__dialogue">
            <div className="magicShop__dialogueHeader">
              <span className="magicShop__dot" />
              VA&apos;SHIR
            </div>
            <p className="magicShop__dialogueLine">
              {displayedText}
              {isTyping && <span className="magicShop__cursor">|</span>}
            </p>

            <div
              className={`magicShop__actions${isTyping ? " magicShop__actions--waiting" : ""}`}
            >
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
                disabled={isTyping}
                onClick={() => navigate(MAGIC_SHOP_SELECT_AVATAR_PATH)}
              >
                ENTER SHOP
              </button>
            </div>
          </div>
        </div>
      </div>
    </MagicShopShell>
  );
}
