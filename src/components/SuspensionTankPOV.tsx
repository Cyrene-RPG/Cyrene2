import type { ContainmentRevealLevel } from "../data/story-containment-beats";
import "./SuspensionTankPOV.css";

type Props = {
  revealLevel: ContainmentRevealLevel;
};

export default function SuspensionTankPOV({ revealLevel }: Props) {
  return (
    <div
      className={`tankPov tankPov--reveal-${revealLevel}`}
      role="img"
      aria-label="First-person view restrained inside an unknown immersion chamber"
    >
      <div className="tankPov__viewport">
        <div className="tankPov__chamberGlow" />
        <div className="tankPov__fluidField">
          <div className="tankPov__fluid" />
          <div className="tankPov__fluidShimmer" />
          <div className="tankPov__bubble tankPov__bubble--1" />
          <div className="tankPov__bubble tankPov__bubble--2" />
          <div className="tankPov__bubble tankPov__bubble--3" />
        </div>

        <div className="tankPov__glass tankPov__glass--left" />
        <div className="tankPov__glass tankPov__glass--right" />
        <div className="tankPov__glass tankPov__glass--top" />
        <div className="tankPov__condensation" />

        <div className="tankPov__restraint tankPov__restraint--left">
          <span className="tankPov__restraintCuff" />
          <span className="tankPov__restraintStrap" />
        </div>
        <div className="tankPov__restraint tankPov__restraint--right">
          <span className="tankPov__restraintCuff" />
          <span className="tankPov__restraintStrap" />
        </div>

        <div className="tankPov__bodySilhouette" aria-hidden />

        <div className="tankPov__maskAssembly">
          <div className="tankPov__maskHose" />
          <div className="tankPov__maskCup">
            <div className="tankPov__maskSeal" />
            <div className="tankPov__maskVent" />
          </div>
          <div className="tankPov__maskStrap tankPov__maskStrap--left" />
          <div className="tankPov__maskStrap tankPov__maskStrap--right" />
        </div>

        <div className="tankPov__scanBand" />
        <div className="tankPov__noise" />
      </div>
    </div>
  );
}
