import { useLocation, useNavigate } from "react-router-dom";
import {
  isAvatarForgePaused,
} from "../lib/avatar-forge-config";
import { useAuth } from "../hooks/useAuth";
import {
  disableDevLandForge,
  isDevMode,
  openDevProfile,
  prepareDevForgeSkip,
  replayPostSignupOnboarding,
} from "../lib/dev-shortcuts";

function isOnboardingRoute(pathname: string) {
  return (
    pathname === "/link-up" ||
    pathname === "/avatar-forge" ||
    pathname.startsWith("/avatar-forge/")
  );
}

export default function DevShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!isDevMode()) return null;

  const operatorName =
    user?.user_metadata?.username ??
    user?.email?.split("@")[0] ??
    "operator";

  const onProfile = location.pathname === "/profile";
  const onOnboard = isOnboardingRoute(location.pathname);

  return (
    <div className="devShortcuts">
      <button
        type="button"
        className="devShortcuts__btn"
        onClick={() => window.location.reload()}
        title="Dev refresh"
      >
        ↻ REFRESH
      </button>
      <button
        type="button"
        className={`devShortcuts__btn${onProfile ? " devShortcuts__btn--active" : ""}`}
        onClick={() => openDevProfile(navigate)}
        title="Open operator profile"
      >
        → PROFILE
      </button>
      <button
        type="button"
        className={`devShortcuts__btn devShortcuts__btn--highlight${
          onOnboard ? " devShortcuts__btn--active" : ""
        }`}
        onClick={() => replayPostSignupOnboarding(navigate, operatorName)}
        title="Replay link-up walkthrough, then avatar forge"
      >
        → ONBOARD
      </button>
      <button
        type="button"
        className="devShortcuts__btn"
        onClick={() => {
          if (isAvatarForgePaused()) return;
          prepareDevForgeSkip();
          navigate("/avatar-forge", { replace: true });
        }}
        disabled={isAvatarForgePaused()}
        title={
          isAvatarForgePaused()
            ? "Avatar forge is paused"
            : "Skip to avatar forge"
        }
      >
        → FORGE
      </button>
      <button
        type="button"
        className="devShortcuts__btn"
        onClick={() => {
          disableDevLandForge();
          navigate("/", { replace: true });
        }}
        title="Disable forge skip and go home"
      >
        HOME
      </button>
    </div>
  );
}
