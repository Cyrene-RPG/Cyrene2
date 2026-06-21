import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PROFILE_PATH } from "../lib/avatar-forge-config";

export default function ForgePausedRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(PROFILE_PATH, { replace: true });
  }, [navigate]);

  return null;
}
