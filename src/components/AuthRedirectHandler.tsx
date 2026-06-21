import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isDevLandForgeEnabled } from "../lib/dev-shortcuts";
import { hasPendingLinkUp } from "../lib/app-url";
import { supabase } from "../lib/supabase";

export default function AuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return;

      const pathname = window.location.pathname;
      const onOnboardingRoute =
        pathname === "/link-up" ||
        pathname === "/avatar-forge" ||
        pathname.startsWith("/avatar-forge/");

      if (
        (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        hasPendingLinkUp() &&
        !isDevLandForgeEnabled() &&
        !onOnboardingRoute &&
        pathname !== "/profile"
      ) {
        navigate("/link-up", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}
