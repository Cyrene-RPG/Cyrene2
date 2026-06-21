import "./UnknownFigure.css";

type UnknownFigureProps = {
  variant?: "default" | "idCard";
};

export default function UnknownFigure({ variant = "default" }: UnknownFigureProps) {
  const isIdCard = variant === "idCard";

  return (
    <div
      className={`unknownFigure${
        isIdCard ? " unknownFigure--idCard" : ""
      }`}
    >
      {isIdCard ? (
        <div className="unknownFigure__card">
          <div className="unknownFigure__cardHeader">
            <span className="unknownFigure__cardOrg">CYRENE SYSTEMS</span>
            <div className="unknownFigure__cardMeta">
              <span className="unknownFigure__cardSerial">ID-0000-UNASSIGNED</span>
              <span className="unknownFigure__cardType">OPERATOR ID</span>
            </div>
          </div>

          <div className="unknownFigure__photoFrame">
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
          </div>

          <dl className="unknownFigure__fields">
            <div className="unknownFigure__field">
              <dt>NAME</dt>
              <dd>UNREGISTERED</dd>
            </div>
            <div className="unknownFigure__field">
              <dt>SPECIES</dt>
              <dd>PENDING</dd>
            </div>
            <div className="unknownFigure__field">
              <dt>STATUS</dt>
              <dd className="unknownFigure__fieldVal--warn">UNRESOLVED</dd>
            </div>
          </dl>

          <div className="unknownFigure__cardFooter">
            <span className="unknownFigure__stamp">AWAITING IMPRINT</span>
            <span className="unknownFigure__barcode" aria-hidden />
            <span className="unknownFigure__label">IDENTITY UNRESOLVED</span>
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
