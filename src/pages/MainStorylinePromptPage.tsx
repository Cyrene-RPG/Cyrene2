import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LOGIN_PATH, STORY_AWAKENING_PATH } from "../lib/auth-routes";
import {
  fetchStorylineChoice,
  saveMainStorylineChoice,
  type MainStorylineChoice,
} from "../lib/storyline";
import { isSupabaseConfigured } from "../lib/supabase";
import "./MainStorylinePromptPage.css";

export default function MainStorylinePromptPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate(LOGIN_PATH, { replace: true });
      return;
    }

    let cancelled = false;

    void fetchStorylineChoice(user.id)
      .then((choice) => {
        if (cancelled) return;
        if (choice) {
          navigate("/", { replace: true });
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, navigate, user]);

  const handleChoice = useCallback(
    async (choice: MainStorylineChoice) => {
      if (submitting) return;
      setError(null);
      setSubmitting(true);

      try {
        await saveMainStorylineChoice(choice);
        navigate(choice === "yes" ? STORY_AWAKENING_PATH : "/", {
          replace: true,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to record your choice.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [navigate, submitting],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (submitting || checking) return;
      if (event.key === "y" || event.key === "Y") {
        event.preventDefault();
        void handleChoice("yes");
      }
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        void handleChoice("no");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [checking, handleChoice, submitting]);

  if (loading || checking) {
    return (
      <div className="storylinePrompt">
        <div className="storylinePrompt__bg" />
        <div className="storylinePrompt__loading">SCANNING OPERATOR FILE...</div>
      </div>
    );
  }

  return (
    <div className={`storylinePrompt ${visible ? "storylinePrompt--ready" : ""}`}>
      <div className="storylinePrompt__bg" />
      <div className="storylinePrompt__vignette" />
      <div className="storylinePrompt__scanlines" />

      <div className="storylinePrompt__hud storylinePrompt__hud--tl">
        <span>MODULE</span>
        <span className="storylinePrompt__hudVal">ST-INTRO-01</span>
      </div>
      <div className="storylinePrompt__hud storylinePrompt__hud--tr">
        <span>STATUS</span>
        <span className="storylinePrompt__hudVal storylinePrompt__hudVal--live">
          AWAITING INPUT
        </span>
      </div>

      <main className="storylinePrompt__main">
        <section
          className="storylinePrompt__box"
          role="dialog"
          aria-modal="true"
          aria-labelledby="storylinePromptTitle"
        >
          <p className="storylinePrompt__eyebrow">MAIN STORYLINE PROTOCOL</p>
          <h1 id="storylinePromptTitle" className="storylinePrompt__title">
            BEGIN THE MAIN STORYLINE?
          </h1>
          <p className="storylinePrompt__copy">
            Your operator file is active. Cyrene can route you into the primary
            narrative arc now, or you may hold position on the title screen until
            you are ready.
          </p>

          {!isSupabaseConfigured && (
            <div className="storylinePrompt__alert">
              DATABASE OFFLINE — Your choice cannot be saved yet.
            </div>
          )}

          {error && <div className="storylinePrompt__error">{error}</div>}

          <div className="storylinePrompt__actions">
            <button
              type="button"
              className="storylinePrompt__btn storylinePrompt__btn--yes"
              disabled={submitting || !isSupabaseConfigured}
              onClick={() => void handleChoice("yes")}
            >
              <span className="storylinePrompt__btnKey">Y</span>
              <span>{submitting ? "RECORDING..." : "YES — START STORYLINE"}</span>
            </button>
            <button
              type="button"
              className="storylinePrompt__btn storylinePrompt__btn--no"
              disabled={submitting || !isSupabaseConfigured}
              onClick={() => void handleChoice("no")}
            >
              <span className="storylinePrompt__btnKey">N</span>
              <span>{submitting ? "RECORDING..." : "NO — NOT YET"}</span>
            </button>
          </div>

          <p className="storylinePrompt__hint">
            This choice is logged to your operator file.
          </p>
        </section>
      </main>
    </div>
  );
}
