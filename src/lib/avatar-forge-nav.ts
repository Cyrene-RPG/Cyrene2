import type { NavigateFunction } from "react-router-dom";
import { clearAvatarDraft, type AvatarDraft } from "./avatar-draft";
import { clearPersonalAiHud } from "./avatar-forge-hud";
import { disableDevLandForge } from "./dev-shortcuts";
import { speciesHasSubspecies } from "../data/subspecies";

export function goToMainMenu(navigate: NavigateFunction) {
  disableDevLandForge();
  navigate("/", { replace: true });
}

export function startNewAvatarForge(navigate: NavigateFunction) {
  clearAvatarDraft();
  clearPersonalAiHud();
  navigate("/avatar-forge", { replace: true });
}

export function getIdentityBackRoute(draft: AvatarDraft): string {
  if (draft.speciesId && speciesHasSubspecies(draft.speciesId)) {
    return "/avatar-forge/subspecies";
  }
  return "/avatar-forge";
}

export function getIdentityBackLabel(draft: AvatarDraft): string {
  if (draft.speciesId && speciesHasSubspecies(draft.speciesId)) {
    return "CHANGE SUBSPECIES";
  }
  return "CHANGE SPECIES";
}
