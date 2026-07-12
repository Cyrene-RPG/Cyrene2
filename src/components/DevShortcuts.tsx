import { useLocation, useNavigate } from "react-router-dom";
import { isDevMode } from "../lib/dev-shortcuts";

export default function DevShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isDevMode()) return null;

  const onHome = location.pathname === "/";

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
    </div>
  );
}
