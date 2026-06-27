import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { sendPasswordReset, signIn } from "../lib/auth";
import { getPostLoginPath, SIGNUP_PATH } from "../lib/auth-routes";
import { isSupabaseConfigured } from "../lib/supabase";
import "../components/AuthPage.css";

const TERMINAL_LINES = [
  "CYRENE SESSION PROTOCOL v2.1",
  "SCANNING OPERATOR CREDENTIALS...",
  "NEURAL LINK: STANDBY",
  "DISTRICT ACCESS: LOCKED",
];

const FIELDS = [
  { id: "email", label: "UPLINK ADDRESS", step: "01" },
  { id: "password", label: "ACCESS KEY", step: "02" },
] as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState<string>("email");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(getPostLoginPath(location.state), { replace: true });
    }
  }, [loading, location.state, navigate, user]);

  const filledCount = [email, password].filter((value) => value.length > 0).length;
  const progress = (filledCount / 2) * 100;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!isSupabaseConfigured) {
      setError("NETWORK OFFLINE — Database unreachable.");
      return;
    }

    setSubmitting(true);

    try {
      await signIn(email, password);
      navigate(getPostLoginPath(location.state), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "SIGN-IN FAILED.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setNotice(null);

    if (!isSupabaseConfigured) {
      setError("NETWORK OFFLINE — Database unreachable.");
      return;
    }

    setResetting(true);

    try {
      await sendPasswordReset(email);
      setNotice("Password reset uplink sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "RESET REQUEST FAILED.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <AuthLayout
      code="ID-AUTH-02"
      eyebrow="SESSION PROTOCOL"
      title="RESUME SESSION"
      subtitle="Authenticate your operator file"
      terminalLines={TERMINAL_LINES}
      footer={
        <>
          NEW OPERATOR? <Link to={SIGNUP_PATH}>REGISTER IDENTITY →</Link>
        </>
      }
    >
      <form className="authForm" onSubmit={handleSubmit}>
        <div className="authForm__meta">
          <span className="authForm__status">
            <span className="authForm__pulse" />
            SECURE CHANNEL ACTIVE
          </span>
          <span className="authForm__progress">{Math.round(progress)}%</span>
        </div>

        <div className="authForm__progressTrack">
          <div
            className="authForm__progressFill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {error ? (
          <div className="authError">
            <span className="authError__icon">!</span>
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="authNotice">
            <span className="authNotice__icon">✓</span>
            {notice}
          </div>
        ) : null}

        <div className="authFields">
          {FIELDS.map((field) => {
            const isFocused = focusedField === field.id;
            const values: Record<string, string> = { email, password };
            const hasValue = values[field.id].length > 0;

            return (
              <label
                key={field.id}
                className={`authField ${isFocused ? "authField--focused" : ""} ${
                  hasValue ? "authField--filled" : ""
                }`}
              >
                <div className="authField__head">
                  <span className="authField__step">{field.step}</span>
                  <span className="authField__label">{field.label}</span>
                  {hasValue ? <span className="authField__check">OK</span> : null}
                </div>
                <input
                  className="authField__input"
                  type={field.id === "password" ? "password" : "email"}
                  placeholder={
                    field.id === "email" ? "operator@domain.com" : "••••••••"
                  }
                  value={values[field.id]}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (field.id === "email") setEmail(value);
                    if (field.id === "password") setPassword(value);
                  }}
                  onFocus={() => setFocusedField(field.id)}
                  disabled={submitting || resetting}
                  autoComplete={
                    field.id === "email" ? "email" : "current-password"
                  }
                  required
                />
              </label>
            );
          })}
        </div>

        <div className="authForm__linkRow">
          <button
            type="button"
            className="authForm__linkBtn"
            onClick={handleForgotPassword}
            disabled={submitting || resetting}
          >
            {resetting ? "SENDING RESET UPLINK..." : "FORGOT ACCESS KEY?"}
          </button>
        </div>

        <button className="authSubmit" type="submit" disabled={submitting || resetting}>
          <span className="authSubmit__cursor">▶</span>
          <span className="authSubmit__text">
            {submitting ? "AUTHENTICATING..." : "RESUME SESSION"}
          </span>
          <span className="authSubmit__index">03</span>
        </button>
      </form>
    </AuthLayout>
  );
}
