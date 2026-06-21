import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isDevLandForgeEnabled, prepareDevForgeSkip } from "../lib/dev-shortcuts";
import { isAvatarForgePaused } from "../lib/avatar-forge-config";

function isForgeRoute(pathname: string) {
  return (
    pathname === "/avatar-forge" || pathname.startsWith("/avatar-forge/")
  );
}

function isDevLandingExempt(pathname: string) {
  return (
    isForgeRoute(pathname) ||
    pathname === "/profile" ||
    pathname === "/link-up" ||
    pathname.startsWith("/magic-shop")
  );
}

export default function DevBootRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const hasBootRedirected = useRef(false);

  useEffect(() => {
    if (isAvatarForgePaused()) return;
    if (!isDevLandForgeEnabled()) return;
    if (loading) return;
    if (!user) return;

    prepareDevForgeSkip();

    if (isDevLandingExempt(location.pathname)) return;

    if (!hasBootRedirected.current) {
      hasBootRedirected.current = true;
      navigate("/avatar-forge", { replace: true });
    }
  }, [loading, user, location.pathname, navigate]);

  return null;
}
