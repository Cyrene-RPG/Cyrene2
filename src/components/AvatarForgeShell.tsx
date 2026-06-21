import type { ReactNode } from "react";
import { isPersonalAiHudActive } from "../lib/avatar-forge-hud";

type AvatarForgeShellProps = {
  username: string;
  stepLabel: string;
  metaLabel: string;
  metaValue: string;
  /** Overrides bottom-right HUD when not in personal-AI mode (e.g. species step). */
  brLabel?: string;
  brValue?: string;
  children: ReactNode;
};

export function useAvatarForgeHud() {
  const personalAiHud = isPersonalAiHudActive();

  return {
    personalAiHud,
    figureVariant: personalAiHud ? ("idCard" as const) : ("default" as const),
    prompt: personalAiHud ? "AI>" : ">",
    panelClass: personalAiHud ? " avatarForge__panel--personalAi" : "",
  };
}

export function AvatarForgeShell({
  username,
  stepLabel,
  metaLabel,
  metaValue,
  brLabel,
  brValue,
  children,
}: AvatarForgeShellProps) {
  const { personalAiHud } = useAvatarForgeHud();
  const hudBrLabel = personalAiHud ? "MODE" : (brLabel ?? metaLabel);
  const hudBrValue = personalAiHud ? "ASSISTANT" : (brValue ?? metaValue);

  return (
    <div
      className={`avatarForge${
        personalAiHud ? " avatarForge--personalAi" : ""
      }`}
    >
      <div className="avatarForge__bg" />
      <div className="avatarForge__scanlines" />
      <div className="avatarForge__vignette" />

      <div className="avatarForge__frame avatarForge__frame--tl" />
      <div className="avatarForge__frame avatarForge__frame--tr" />
      <div className="avatarForge__frame avatarForge__frame--bl" />
      <div className="avatarForge__frame avatarForge__frame--br" />

      {personalAiHud ? (
        <div className="avatarForge__hudRail" aria-hidden>
          <span className="avatarForge__hudRailPulse" />
          <span className="avatarForge__hudRailText">
            UPLINK STABLE · NEURAL CHANNEL OPEN · CYRENE ASSISTANT v2.4
          </span>
        </div>
      ) : null}

      <div className="avatarForge__hud avatarForge__hud--tl">
        <span>MODULE</span>
        <span className="avatarForge__hudVal">
          {personalAiHud ? "PERSONAL-AI" : "AVATAR-FORGE"}
        </span>
      </div>
      <div className="avatarForge__hud avatarForge__hud--tr">
        <span>OPERATOR</span>
        <span className="avatarForge__hudVal avatarForge__hudVal--accent">
          {username.toUpperCase()}
        </span>
      </div>
      <div className="avatarForge__hud avatarForge__hud--bl">
        <span>STEP</span>
        <span className="avatarForge__hudVal avatarForge__hudVal--live">
          {stepLabel}
        </span>
      </div>
      <div className="avatarForge__hud avatarForge__hud--br">
        <span>{hudBrLabel}</span>
        <span className="avatarForge__hudVal">{hudBrValue}</span>
      </div>

      {children}
    </div>
  );
}

type AvatarForgePageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  personalEyebrow?: string;
  personalSubtitle?: string;
};

export function AvatarForgePageHeader({
  eyebrow,
  title,
  subtitle,
  personalEyebrow,
  personalSubtitle,
}: AvatarForgePageHeaderProps) {
  const { personalAiHud } = useAvatarForgeHud();

  return (
    <div className="avatarForge__header">
      <p className="avatarForge__eyebrow">
        {personalAiHud ? (personalEyebrow ?? "NEURAL LINK ACTIVE") : eyebrow}
      </p>
      <h1 className="avatarForge__title">
        {personalAiHud ? "PERSONAL AI" : title}
      </h1>
      <p className="avatarForge__subtitle">
        {personalAiHud ? (personalSubtitle ?? subtitle) : subtitle}
      </p>
    </div>
  );
}

export function AvatarForgePanelHeader() {
  const { personalAiHud } = useAvatarForgeHud();

  if (personalAiHud) {
    return (
      <div className="avatarForge__panelHeader">
        <span className="avatarForge__panelHeaderMain">
          <span className="avatarForge__dot" />
          CYRENE // ONLINE
        </span>
        <span className="avatarForge__panelSignal">
          <span className="avatarForge__panelSignalBar" />
          <span className="avatarForge__panelSignalBar" />
          <span className="avatarForge__panelSignalBar" />
          SIGNAL 98%
        </span>
      </div>
    );
  }

  return (
    <div className="avatarForge__panelHeader">
      <span className="avatarForge__dot" />
      SYSTEM GUIDANCE
    </div>
  );
}
