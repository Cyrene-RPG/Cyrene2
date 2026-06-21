const PERSONAL_AI_HUD_KEY = "cyrene-personal-ai-hud";

export function enablePersonalAiHud() {
  sessionStorage.setItem(PERSONAL_AI_HUD_KEY, "1");
}

export function isPersonalAiHudActive() {
  return sessionStorage.getItem(PERSONAL_AI_HUD_KEY) === "1";
}

export function clearPersonalAiHud() {
  sessionStorage.removeItem(PERSONAL_AI_HUD_KEY);
}
