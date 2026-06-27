import { useEffect, useState } from "react";
import {
  AVATAR_DRAFT_CHANGE_EVENT,
  loadAvatarDraft,
  type AvatarDraft,
} from "../lib/avatar-draft";

export function useAvatarDraft() {
  const [draft, setDraft] = useState<AvatarDraft>(() => loadAvatarDraft());

  useEffect(() => {
    function refresh() {
      setDraft(loadAvatarDraft());
    }

    function onDraftChange(event: Event) {
      const detail = (event as CustomEvent<AvatarDraft>).detail;
      setDraft(detail ?? loadAvatarDraft());
    }

    window.addEventListener(AVATAR_DRAFT_CHANGE_EVENT, onDraftChange);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(AVATAR_DRAFT_CHANGE_EVENT, onDraftChange);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return draft;
}
