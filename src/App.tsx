import { useCallback, useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
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
import ProfileAvatarPage from "./pages/ProfileAvatarPage";
import CityMapPage from "./pages/CityMapPage";
import CityLocationPage from "./pages/CityLocationPage";
import GateNineMotelPage from "./pages/locations/GateNineMotelPage";
import MissionsPage from "./pages/MissionsPage";
import HomePage from "./pages/HomePage";
import LinkUpPage from "./pages/LinkUpPage";
import LoginPage from "./pages/LoginPage";
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
        <Route path="/login.html" element={<Navigate to="/login" replace />} />
        <Route path="/signup.html" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/link-up" element={<LinkUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/avatars/:avatarId" element={<ProfileAvatarPage />} />
        <Route path="/city" element={<CityMapPage />} />
        <Route
          path="/city/locations/gate-nine-motel"
          element={<GateNineMotelPage />}
        />
        <Route path="/city/locations/:locationId" element={<CityLocationPage />} />
        <Route path="/missions" element={<MissionsPage />} />
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
