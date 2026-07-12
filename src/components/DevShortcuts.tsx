import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAccess } from "../hooks/useAdminAccess";
import { useAuth } from "../hooks/useAuth";
import { ADMIN_STORYLINE_PATH, STORYLINE_INTRO_PATH } from "../lib/auth-routes";
import { isDevMode, replayStorylinePrompt } from "../lib/dev-shortcuts";

export default function DevShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAdminAccess();
  const { user } = useAuth();

  if (!isDevMode()) return null;

  const onHome = location.pathname === "/";
  const onAdmin = location.pathname === ADMIN_STORYLINE_PATH;
  const onStoryline = location.pathname === STORYLINE_INTRO_PATH;

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
        className={`devShortcuts__btn${onHome ? " devShortcuts__btn--active" : ""}`}
        onClick={() => navigate("/", { replace: true })}
        title="Go to home"
      >
        HOME
      </button>
      {user ? (
        <button
          type="button"
          className={`devShortcuts__btn devShortcuts__btn--highlight${
            onStoryline ? " devShortcuts__btn--active" : ""
          }`}
          onClick={() => void replayStorylinePrompt(navigate)}
          title="Reset storyline choice and open the Yes/No prompt"
        >
          → STORYLINE
        </button>
      ) : null}
      {isAdmin ? (
        <button
          type="button"
          className={`devShortcuts__btn${onAdmin ? " devShortcuts__btn--active" : ""}`}
          onClick={() => navigate(ADMIN_STORYLINE_PATH, { replace: true })}
          title="Open storyline admin console"
        >
          ADMIN
        </button>
      ) : null}
    </div>
  );
}
