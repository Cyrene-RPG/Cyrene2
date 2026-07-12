import { useCallback, useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import DevShortcuts from "./components/DevShortcuts";
import LoadingScreen from "./components/LoadingScreen";
import { useAuth } from "./hooks/useAuth";
import { applySavedFullscreen } from "./lib/desktop-controls";
import { isSupabaseConfigured } from "./lib/supabase";
import HomePage from "./pages/HomePage";
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login.html" element={<Navigate to="/login" replace />} />
        <Route path="/signup.html" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
