import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveResumePath } from "../lib/player-progress";

/** Remember the last in-game route so Resume Game can pick up where the player left off. */
export default function ResumePathTracker() {
  const location = useLocation();

  useEffect(() => {
    saveResumePath(`${location.pathname}${location.search}${location.hash}`);
  }, [location.hash, location.pathname, location.search]);

  return null;
}
