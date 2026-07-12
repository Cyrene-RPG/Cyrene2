import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { signUp } from "../lib/auth";
import { LOGIN_PATH } from "../lib/auth-routes";
import { isSupabaseConfigured } from "../lib/supabase";
import "../components/AuthPage.css";

const TERMINAL_LINES = [
  "CYRENE IDENTITY PROTOCOL v2.1",
  "SCANNING DISTRICT CLEARANCE...",
  "NEURAL LINK: STANDBY",
  "OPERATOR FILE: UNASSIGNED",
];

const FIELDS = [
  { id: "username", label: "OPERATOR HANDLE", step: "01" },
  { id: "email", label: "UPLINK ADDRESS", step: "02" },
  { id: "password", label: "ACCESS KEY", step: "03" },
  { id: "confirm", label: "VERIFY KEY", step: "04" },
] as const;

export default function SignupPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedField, setFocusedField] = useState<string>("username");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  const filledCount = [username, email, password, confirmPassword].filter(
    (v) => v.length > 0,
  ).length;
  const progress = (filledCount / 4) * 100;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError("NETWORK OFFLINE — Database unreachable.");
      return;
    }

    if (password !== confirmPassword) {
      setError("ACCESS KEYS DO NOT MATCH.");
      return;
    }

    if (password.length < 6) {
      setError("ACCESS KEY MUST BE 6+ CHARACTERS.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await signUp({ username, email, password });

      if (result.needsEmailConfirmation) {
        navigate("/verify-email", {
          replace: true,
          state: { email, username },
        });
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRATION FAILED.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      code="ID-REG-01"
      eyebrow="IDENTITY PROTOCOL"
      title="NEW IDENTITY"
      subtitle="Forge your operator file"
      terminalLines={TERMINAL_LINES}
      footer={
        <>
          EXISTING OPERATOR?{" "}
          <Link to={LOGIN_PATH}>RESUME SESSION →</Link>
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

        {error && (
          <div className="authError">
            <span className="authError__icon">!</span>
            {error}
          </div>
        )}

        <div className="authFields">
          {FIELDS.map((field) => {
            const isFocused = focusedField === field.id;
            const values: Record<string, string> = {
              username,
              email,
              password,
              confirm: confirmPassword,
            };
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
                  {hasValue && <span className="authField__check">OK</span>}
                </div>
                <input
                  className="authField__input"
                  type={
                    field.id === "password" || field.id === "confirm"
                      ? "password"
                      : field.id === "email"
                        ? "email"
                        : "text"
                  }
                  placeholder={
                    field.id === "username"
                      ? "unique_handle"
                      : field.id === "email"
                        ? "operator@domain.com"
                        : "••••••••"
                  }
                  value={values[field.id]}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (field.id === "username") setUsername(v);
                    if (field.id === "email") setEmail(v);
                    if (field.id === "password") setPassword(v);
                    if (field.id === "confirm") setConfirmPassword(v);
                  }}
                  onFocus={() => setFocusedField(field.id)}
                  disabled={submitting}
                  autoComplete={
                    field.id === "username"
                      ? "username"
                      : field.id === "email"
                        ? "email"
                        : "new-password"
                  }
                  required
                  minLength={
                    field.id === "username" ? 3 : field.id === "confirm" ? 6 : undefined
                  }
                  maxLength={field.id === "username" ? 24 : undefined}
                />
              </label>
            );
          })}
        </div>

        <button className="authSubmit" type="submit" disabled={submitting}>
          <span className="authSubmit__cursor">▶</span>
          <span className="authSubmit__text">
            {submitting ? "REGISTERING IDENTITY..." : "REGISTER TO CITY"}
          </span>
          <span className="authSubmit__index">05</span>
        </button>
      </form>
    </AuthLayout>
  );
}
