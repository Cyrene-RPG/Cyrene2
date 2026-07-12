import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  ADMIN_STORYLINE_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  STORYLINE_INTRO_PATH,
} from "../lib/auth-routes";
import { fetchStorylineChoice } from "../lib/storyline";

const EXEMPT_PATHS = new Set([
  STORYLINE_INTRO_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  "/verify-email",
  ADMIN_STORYLINE_PATH,
]);

export default function StorylineGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const checkedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      checkedUserId.current = null;
      return;
    }
    if (EXEMPT_PATHS.has(location.pathname)) return;
    if (checkedUserId.current === user.id) return;

    let cancelled = false;

    void fetchStorylineChoice(user.id)
      .then((choice) => {
        if (cancelled) return;
        checkedUserId.current = user.id;
        if (!choice) {
          navigate(STORYLINE_INTRO_PATH, { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) checkedUserId.current = user.id;
      });

    return () => {
      cancelled = true;
    };
  }, [loading, location.pathname, navigate, user]);

  return null;
}
