import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UnknownFigure from "../components/UnknownFigure";
import { resendConfirmationEmail } from "../lib/auth";
import { hasPendingLinkUp } from "../lib/app-url";
import { useAuth } from "../hooks/useAuth";
import "./VerifyEmailPage.css";

type LocationState = {
  email?: string;
  username?: string;
};

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const state = (location.state as LocationState) ?? {};

  const [email] = useState(state.email ?? "");
  const [username] = useState(state.username ?? "");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!email && !hasPendingLinkUp()) {
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (!loading && user) {
      navigate("/link-up", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setPulse((p) => (p + 1) % 4), 800);
    return () => clearInterval(timer);
  }, []);

  async function handleResend() {
    if (!email || resending) return;
    setError(null);
    setResending(true);

    try {
      await resendConfirmationEmail(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resend failed.");
    } finally {
      setResending(false);
    }
  }

  const dots = ".".repeat(pulse);

  return (
    <div className="verifyEmail">
      <div className="verifyEmail__bg" />
      <div className="verifyEmail__scanlines" />
      <div className="verifyEmail__vignette" />

      <div className="verifyEmail__hud verifyEmail__hud--tl">
        <span>MODULE</span>
        <span className="verifyEmail__hudVal">ID-VERIFY</span>
      </div>
      <div className="verifyEmail__hud verifyEmail__hud--tr">
        <span>STATUS</span>
        <span className="verifyEmail__hudVal verifyEmail__hudVal--wait">
          PENDING{dots}
        </span>
      </div>

      <Link to="/" className="verifyEmail__back">
        ◀ MAIN MENU
      </Link>

      <main className="verifyEmail__main">
        <div className="verifyEmail__header">
          <p className="verifyEmail__eyebrow">TRANSMISSION PENDING</p>
          <h1 className="verifyEmail__title">VERIFY UPLINK</h1>
          <p className="verifyEmail__subtitle">Confirm your signal before entry</p>
        </div>

        <div className="verifyEmail__body">
          <div className="verifyEmail__figureWrap">
            <UnknownFigure />
            <div className="verifyEmail__signal">
              <span className="verifyEmail__signalRing" />
              <span className="verifyEmail__signalIcon">✉</span>
            </div>
          </div>

          <div className="verifyEmail__panel">
            <div className="verifyEmail__panelHeader">
              <span className="verifyEmail__dot" />
              OUTBOUND TRANSMISSION
            </div>

            <div className="verifyEmail__statusBox">
              <div className="verifyEmail__statusLine">
                <span className="verifyEmail__prompt">&gt;</span>
                PACKET DISPATCHED
              </div>
              <div className="verifyEmail__statusLine">
                <span className="verifyEmail__prompt">&gt;</span>
                DESTINATION:{" "}
                <span className="verifyEmail__email">{email || "UNKNOWN"}</span>
              </div>
              {username && (
                <div className="verifyEmail__statusLine">
                  <span className="verifyEmail__prompt">&gt;</span>
                  HANDLE:{" "}
                  <span className="verifyEmail__handle">{username}</span>
                </div>
              )}
              <div className="verifyEmail__statusLine verifyEmail__statusLine--blink">
                <span className="verifyEmail__prompt">&gt;</span>
                AWAITING CONFIRMATION{dots}
              </div>
            </div>

            <p className="verifyEmail__instructions">
              A verification transmission has been sent to your uplink. Open your
              inbox, confirm your identity, and the neural link will establish
              automatically.
            </p>

            {error && <div className="verifyEmail__error">{error}</div>}
            {resent && (
              <div className="verifyEmail__resent">
                TRANSMISSION RESENT — Check your inbox.
              </div>
            )}

            <div className="verifyEmail__steps">
              <div className="verifyEmail__step">
                <span>01</span> CHECK INBOX
              </div>
              <div className="verifyEmail__step">
                <span>02</span> CLICK CONFIRM
              </div>
              <div className="verifyEmail__step">
                <span>03</span> ENTER CYRENE
              </div>
            </div>

            <button
              type="button"
              className="verifyEmail__resend"
              onClick={handleResend}
              disabled={resending || !email}
            >
              {resending ? "RESENDING..." : "RESEND TRANSMISSION"}
            </button>
          </div>
        </div>

        <p className="verifyEmail__warning">
          WARNING: All identities are permanently logged. The city remembers
          everything.
        </p>
      </main>
    </div>
  );
}
