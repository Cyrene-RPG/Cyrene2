import { useMemo } from "react";
import { useAvatarDraft } from "../hooks/useAvatarDraft";
import { buildOperatorIdCard } from "../lib/operator-id-card";
import type { OperatorIdFieldTone } from "../lib/operator-id-card";
import "./UnknownFigure.css";

type UnknownFigureProps = {
  variant?: "default" | "idCard";
};

function fieldToneClass(tone: OperatorIdFieldTone) {
  if (tone === "live") return "unknownFigure__fieldVal--live";
  if (tone === "pending") return "unknownFigure__fieldVal--pending";
  return undefined;
}

function stampToneClass(tone: OperatorIdFieldTone) {
  if (tone === "live") return "unknownFigure__permitPhotoStamp--live";
  if (tone === "pending") return "unknownFigure__permitPhotoStamp--pending";
  return "unknownFigure__permitPhotoStamp--default";
}

export default function UnknownFigure({ variant = "default" }: UnknownFigureProps) {
  const draft = useAvatarDraft();
  const isIdCard = variant === "idCard";
  const card = useMemo(
    () => (isIdCard ? buildOperatorIdCard(draft) : null),
    [draft, isIdCard],
  );

  return (
    <div
      className={`unknownFigure${
        isIdCard ? " unknownFigure--idCard" : ""
      }`}
    >
      {isIdCard && card ? (
        <div className="unknownFigure__card unknownFigure__card--permit">
          <div className="unknownFigure__permitHolo" aria-hidden />

          <div className="unknownFigure__permitHeader">
            <div className="unknownFigure__permitSeal" aria-hidden>
              <span>CY</span>
            </div>
            <div className="unknownFigure__permitHeaderText">
              <span className="unknownFigure__permitOrg">
                CYRENE METRO AUTHORITY
              </span>
              <span className="unknownFigure__permitTitle">
                OPERATOR PERMIT
              </span>
              <span className="unknownFigure__permitSubtitle">
                Embodied interface credential · not a government ID
              </span>
            </div>
            <div className="unknownFigure__permitClassBlock">
              <span className="unknownFigure__permitClassLabel">CLASS</span>
              <span className="unknownFigure__permitClass">
                {card.permitClass}
              </span>
            </div>
          </div>

          <div className="unknownFigure__permitBody">
            <div className="unknownFigure__photoFrame">
              <div className="unknownFigure__glow" />
              <img
                className="unknownFigure__img"
                src="/person-outline.png"
                alt=""
                aria-hidden
              />
              <div className="unknownFigure__nameSlot">
                {card.showQuestionMarks ? (
                  <div className="unknownFigure__marks">
                    <span className="unknownFigure__q">?</span>
                    <span className="unknownFigure__q unknownFigure__q--2">?</span>
                    <span className="unknownFigure__q unknownFigure__q--3">?</span>
                  </div>
                ) : (
                  <span className="unknownFigure__initials">{card.initials}</span>
                )}
              </div>
              <span
                className={`unknownFigure__permitPhotoStamp ${stampToneClass(card.stampTone)}`}
                aria-hidden
              >
                {card.stamp}
              </span>
            </div>

            <div className="unknownFigure__permitInfo">
              <div className="unknownFigure__permitNameBlock">
                <span className="unknownFigure__permitFieldLabel">NAME</span>
                <span
                  className={`unknownFigure__permitName ${fieldToneClass(card.nameTone) ?? ""}`}
                >
                  {card.nameLine}
                </span>
              </div>

              <dl className="unknownFigure__permitGrid">
                {card.detailFields.map((field) => (
                  <div
                    key={field.label}
                    className={`unknownFigure__permitCell${
                      field.wide ? " unknownFigure__permitCell--wide" : ""
                    }`}
                  >
                    <dt>{field.label}</dt>
                    <dd className={fieldToneClass(field.tone)}>{field.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="unknownFigure__permitMeta">
                <span>{card.issueLabel}</span>
                <span>{card.expiryLabel}</span>
              </div>
            </div>
          </div>

          <div className="unknownFigure__permitSigRow">
            <div className="unknownFigure__permitSig">
              <span className="unknownFigure__permitSigLabel">OPERATOR SIG</span>
              <span className="unknownFigure__permitSigLine" aria-hidden />
            </div>
          </div>

          <div className="unknownFigure__cardFooter">
            <span className="unknownFigure__mrz">{card.mrzLine}</span>
            <span className="unknownFigure__barcode" aria-hidden />
            <span className="unknownFigure__label">{card.footerLabel}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="unknownFigure__glow" />
          <img
            className="unknownFigure__img"
            src="/person-outline.png"
            alt=""
            aria-hidden
          />
          <div className="unknownFigure__nameSlot">
            <div className="unknownFigure__marks">
              <span className="unknownFigure__q">?</span>
              <span className="unknownFigure__q unknownFigure__q--2">?</span>
              <span className="unknownFigure__q unknownFigure__q--3">?</span>
              <span className="unknownFigure__q unknownFigure__q--4">?</span>
            </div>
          </div>
          <div className="unknownFigure__label">IDENTITY UNRESOLVED</div>
        </>
      )}
    </div>
  );
}
