import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AuthRedirectHandler from "./components/AuthRedirectHandler";
import ForgePausedRedirect from "./components/ForgePausedRedirect";
import DevBootRedirect from "./components/DevBootRedirect";
import DevShortcuts from "./components/DevShortcuts";
import LoadingScreen from "./components/LoadingScreen";
import { useAuth } from "./hooks/useAuth";
import { applySavedFullscreen } from "./lib/desktop-controls";
import { isAvatarForgePaused } from "./lib/avatar-forge-config";
import { isSupabaseConfigured } from "./lib/supabase";
import AvatarForgeClassPage from "./pages/AvatarForgeClassPage";
import AvatarForgeStatsPage from "./pages/AvatarForgeStatsPage";
import AvatarForgeIdentityPage from "./pages/AvatarForgeIdentityPage";
import AvatarForgePage from "./pages/AvatarForgePage";
import AvatarForgeSubspeciesPage from "./pages/AvatarForgeSubspeciesPage";
import MagicShopInteriorPage from "./pages/MagicShopInteriorPage";
import MagicShopAvatarSelectPage from "./pages/MagicShopAvatarSelectPage";
import MagicShopPage from "./pages/MagicShopPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import LinkUpPage from "./pages/LinkUpPage";
import SignupPage from "./pages/SignupPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
function removeBootSplash() {
  const splash = document.getElementById("boot-splash");
  if (!splash) return;
  splash.classList.add("boot-splash--hide");
  window.setTimeout(() => splash.remove(), 400);
}

export default function App() {
  const [bootDone, setBootDone] = useState(false);
  const { loading } = useAuth();
  const authReady = !loading || !isSupabaseConfigured;

  useEffect(() => {
    removeBootSplash();
  }, []);

  useEffect(() => {
    if (!bootDone) return;
    void applySavedFullscreen();
  }, [bootDone]);

  const handleBootComplete = useCallback(() => setBootDone(true), []);

  if (!bootDone) {
    return (
      <>
        <DevShortcuts />
        <LoadingScreen authReady={authReady} onComplete={handleBootComplete} />
      </>
    );
  }

  return (
    <>
      <DevShortcuts />
      <DevBootRedirect />
      <AuthRedirectHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/link-up" element={<LinkUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/magic-shop/browse" element={<MagicShopInteriorPage />} />
        <Route
          path="/magic-shop/select-avatar"
          element={<MagicShopAvatarSelectPage />}
        />
        <Route path="/magic-shop" element={<MagicShopPage />} />
        {isAvatarForgePaused() ? (
          <Route path="/avatar-forge/*" element={<ForgePausedRedirect />} />
        ) : (
          <>
            <Route
              path="/avatar-forge/stats"
              element={<AvatarForgeStatsPage />}
            />
            <Route
              path="/avatar-forge/class"
              element={<AvatarForgeClassPage />}
            />
            <Route
              path="/avatar-forge/identity"
              element={<AvatarForgeIdentityPage />}
            />
            <Route
              path="/avatar-forge/subspecies"
              element={<AvatarForgeSubspeciesPage />}
            />
            <Route path="/avatar-forge" element={<AvatarForgePage />} />
          </>
        )}
      </Routes>
    </>
  );}
