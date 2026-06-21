import type { ReactNode } from "react";
import "./MysteryManHaze.css";

const MYSTERY_MAN_SRC = "/mystery-man-silhouette.png";

export type MysteryManHazeProps = {
  eyesOpen: boolean;
  lidOpenPct: number;
  figureVisible: boolean;
  struggling?: boolean;
  children?: ReactNode;
};

export default function MysteryManHaze({
  eyesOpen,
  lidOpenPct,
  figureVisible,
  struggling = false,
  children,
}: MysteryManHazeProps) {
  return (
    <div
      className={`mysteryHaze${eyesOpen ? " mysteryHaze--eyes-open" : " mysteryHaze--eyes-closed"}${
        figureVisible ? " mysteryHaze--figure-visible" : ""
      }${struggling ? " mysteryHaze--struggling" : ""}`}
      style={{ "--lid-height": `${lidOpenPct}%` } as React.CSSProperties}
      role="region"
      aria-label="Figure seen through preservation fluid"
    >
      <div className="mysteryHaze__viewport" aria-hidden>
        <div className="mysteryHaze__liquidMotion">
          <div className="mysteryHaze__depth" />
          <div className="mysteryHaze__fluid" />
          <div className="mysteryHaze__distortion" />
          <div className="mysteryHaze__haze" />
          <div className="mysteryHaze__condensation" />
        </div>

        <div className="mysteryHaze__figureWrap">
          <div className="mysteryHaze__figurePlate" aria-hidden />
          <img
            className="mysteryHaze__figure"
            src={MYSTERY_MAN_SRC}
            alt=""
            draggable={false}
          />
        </div>
      </div>

      {children ? (
        <div className="mysteryHaze__overlay">
          <div className="mysteryHaze__overlayPanel">{children}</div>
        </div>
      ) : null}

      <div className="mysteryHaze__lid mysteryHaze__lid--top" aria-hidden />
      <div className="mysteryHaze__lid mysteryHaze__lid--bottom" aria-hidden />
    </div>
  );
}
