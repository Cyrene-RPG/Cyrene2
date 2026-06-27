import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  calcGateNineBookingTotal,
  GATE_NINE_BOOKING_TIME_NOTE,
  GATE_NINE_DESK,
  GATE_NINE_DURATIONS,
  GATE_NINE_EXTERIOR,
  GATE_NINE_LOBBY,
  GATE_NINE_MOTEL_ID,
  GATE_NINE_ROOMS,
  GATE_NINE_WASHROOM_UPGRADE_CREDITS,
  type GateNineDurationId,
  type GateNineRoomId,
} from "../../data/gate-nine-motel";
import { useAuth } from "../../hooks/useAuth";
import { useTypewriter } from "../../hooks/useTypewriter";
import { CITY_PATH } from "../../lib/city-config";
import { redirectToLogin } from "../../lib/auth-routes";
import {
  getLocationScene,
  hasEnteredLocation,
  markLocationEntered,
  setLocationScene,
} from "../../lib/location-visits";
import "./GateNineMotelPage.css";

type View = "exterior" | "lobby" | "desk" | "book";

const GATE_NINE_SCENES: View[] = ["exterior", "lobby", "desk", "book"];

function resolveGateNineView(userId: string): View {
  if (!hasEnteredLocation(userId, GATE_NINE_MOTEL_ID)) {
    return "exterior";
  }

  const saved = getLocationScene(userId, GATE_NINE_MOTEL_ID);
  if (saved && GATE_NINE_SCENES.includes(saved as View)) {
    return saved as View;
  }

  return "lobby";
}

function parseProseWithBold(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < text.length) {
    if (text[index] === "*") {
      const close = text.indexOf("*", index + 1);
      if (close === -1) {
        parts.push(text.slice(index));
        break;
      }
      parts.push(<strong key={key++}>{text.slice(index + 1, close)}</strong>);
      index = close + 1;
      continue;
    }

    const next = text.indexOf("*", index);
    const end = next === -1 ? text.length : next;
    parts.push(text.slice(index, end));
    index = end;
  }

  return parts;
}

export default function GateNineMotelPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>("exterior");
  const [ready, setReady] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<GateNineRoomId>("single-bunk");
  const [selectedDurationId, setSelectedDurationId] =
    useState<GateNineDurationId>("1-night");
  const [washroomUpgrade, setWashroomUpgrade] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const operatorLabel = useMemo(
    () =>
      (
        user?.user_metadata?.username ??
        user?.email?.split("@")[0] ??
        "OPERATOR"
      ).toUpperCase(),
    [user],
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      redirectToLogin(navigate, "/city/locations/gate-nine-motel");
      return;
    }
    if (lastUserIdRef.current !== user.id) {
      lastUserIdRef.current = user.id;
      initializedRef.current = false;
    }
    if (initializedRef.current) return;

    initializedRef.current = true;
    setView(resolveGateNineView(user.id));
    setReady(true);
  }, [loading, navigate, user]);

  function persistView(nextView: View) {
    if (!user) return;
    if (nextView === "exterior") return;
    markLocationEntered(user.id, GATE_NINE_MOTEL_ID);
    setLocationScene(user.id, GATE_NINE_MOTEL_ID, nextView);
  }

  function handleLeave() {
    navigate(CITY_PATH);
  }

  function handleEnter() {
    if (!user) return;
    persistView("lobby");
    setView("lobby");
  }

  function handleApproachDesk() {
    persistView("desk");
    setView("desk");
  }

  function handleBackToLobby() {
    persistView("lobby");
    setView("lobby");
  }

  function handleBookRoom() {
    persistView("book");
    setView("book");
  }

  function handleBackToDesk() {
    persistView("desk");
    setView("desk");
  }

  const bookingTotal = useMemo(
    () =>
      calcGateNineBookingTotal(
        selectedRoomId,
        selectedDurationId,
        washroomUpgrade,
      ),
    [selectedDurationId, selectedRoomId, washroomUpgrade],
  );

  const selectedRoom = useMemo(
    () => GATE_NINE_ROOMS.find((room) => room.id === selectedRoomId),
    [selectedRoomId],
  );

  const selectedDuration = useMemo(
    () => GATE_NINE_DURATIONS.find((entry) => entry.id === selectedDurationId),
    [selectedDurationId],
  );

  const proseText = useMemo(() => {
    switch (view) {
      case "exterior":
        return GATE_NINE_EXTERIOR;
      case "lobby":
        return GATE_NINE_LOBBY;
      case "desk":
        return GATE_NINE_DESK;
      default:
        return "";
    }
  }, [view]);

  const { displayedText, isTyping, skip } = useTypewriter(proseText, 40, {
    paragraphPauseMs: 550,
  });

  function handleProseClick() {
    if (isTyping) skip();
  }

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isTyping) return;
    panel.scrollTop = panel.scrollHeight;
  }, [displayedText, isTyping]);

  if (loading || !ready || !user) {
    return (
      <div className="gateNine">
        <div className="gateNine__bg" />
        <div className="gateNine__loading">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="gateNine">
      <div className="gateNine__bg" />
      <div className="gateNine__scanlines" />
      <div className="gateNine__vignette" />

      <div className="gateNine__hud gateNine__hud--tl">
        <span>LOCATION</span>
        <span className="gateNine__hudVal">VISITOR RING</span>
      </div>
      <div className="gateNine__hud gateNine__hud--tr">
        <span>OPERATOR</span>
        <span className="gateNine__hudVal gateNine__hudVal--accent">
          {operatorLabel}
        </span>
      </div>

      <main className="gateNine__main">
        <div className="gateNine__panel" ref={panelRef}>
          {view === "exterior" ? (
            <>
              <p className="gateNine__eyebrow">VISITOR RING · EXTERIOR</p>
              <h1 className="gateNine__title">Gate Nine Motel</h1>
              <p className="gateNine__tag">Cheap — room doors · $</p>
              <p
                className={`gateNine__prose${isTyping ? " gateNine__prose--typing" : ""}`}
                onClick={handleProseClick}
              >
                {parseProseWithBold(displayedText)}
                {isTyping ? <span className="gateNine__cursor">|</span> : null}
              </p>
              <div
                className={`gateNine__actions${isTyping ? " gateNine__actions--waiting" : ""}`}
              >
                <button
                  type="button"
                  className="gateNine__btn gateNine__btn--enter"
                  onClick={handleEnter}
                  disabled={isTyping}
                >
                  ENTER
                </button>
                <button
                  type="button"
                  className="gateNine__btn gateNine__btn--leave"
                  onClick={handleLeave}
                  disabled={isTyping}
                >
                  LEAVE
                </button>
              </div>
            </>
          ) : null}

          {view === "lobby" ? (
            <>
              <p className="gateNine__eyebrow">GATE NINE MOTEL · LOBBY</p>
              <h1 className="gateNine__title">Gate Nine Motel</h1>
              <p className="gateNine__tag">Front desk · room keys</p>
              <p
                className={`gateNine__prose${isTyping ? " gateNine__prose--typing" : ""}`}
                onClick={handleProseClick}
              >
                {parseProseWithBold(displayedText)}
                {isTyping ? <span className="gateNine__cursor">|</span> : null}
              </p>
              <div
                className={`gateNine__actions${isTyping ? " gateNine__actions--waiting" : ""}`}
              >
                <button
                  type="button"
                  className="gateNine__btn gateNine__btn--enter"
                  onClick={handleApproachDesk}
                  disabled={isTyping}
                >
                  APPROACH DESK TO BOOK ROOM
                </button>
                <button
                  type="button"
                  className="gateNine__btn gateNine__btn--leave"
                  onClick={handleLeave}
                  disabled={isTyping}
                >
                  LEAVE
                </button>
              </div>
            </>
          ) : null}

          {view === "desk" ? (
            <>
              <p className="gateNine__eyebrow">GATE NINE MOTEL · FRONT DESK</p>
              <h1 className="gateNine__title">Gate Nine Motel</h1>
              <p className="gateNine__tag">Check-in · pay upfront</p>
              <p
                className={`gateNine__prose${isTyping ? " gateNine__prose--typing" : ""}`}
                onClick={handleProseClick}
              >
                {parseProseWithBold(displayedText)}
                {isTyping ? <span className="gateNine__cursor">|</span> : null}
              </p>
              <div
                className={`gateNine__actions${isTyping ? " gateNine__actions--waiting" : ""}`}
              >
                <button
                  type="button"
                  className="gateNine__btn gateNine__btn--enter"
                  onClick={handleBookRoom}
                  disabled={isTyping}
                >
                  BOOK A ROOM
                </button>
                <button
                  type="button"
                  className="gateNine__btn gateNine__btn--leave"
                  onClick={handleBackToLobby}
                  disabled={isTyping}
                >
                  BACK TO LOBBY
                </button>
              </div>
            </>
          ) : null}

          {view === "book" ? (
            <>
              <p className="gateNine__eyebrow">GATE NINE MOTEL · BOOKING</p>
              <h1 className="gateNine__title">Book a Room</h1>
              <p className="gateNine__tag">Pay upfront · checkout at 1100</p>

              <p className="gateNine__bookingLead">
                The clerk slides a datapad through the slot. Pick a room and how
                long you&apos;re staying.
              </p>

              <section className="gateNine__bookingSection">
                <h2 className="gateNine__bookingHeading">Room type</h2>
                <div className="gateNine__optionList">
                  {GATE_NINE_ROOMS.map((room) => {
                    const selected = room.id === selectedRoomId;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        className={`gateNine__option${selected ? " gateNine__option--selected" : ""}`}
                        onClick={() => setSelectedRoomId(room.id)}
                      >
                        <span className="gateNine__optionTitle">{room.name}</span>
                        <span className="gateNine__optionMeta">
                          {room.creditsPerNight} credits / night
                        </span>
                        <span className="gateNine__optionDesc">
                          {room.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="gateNine__bookingSection">
                <h2 className="gateNine__bookingHeading">Duration</h2>
                <div className="gateNine__durationRow">
                  {GATE_NINE_DURATIONS.map((duration) => {
                    const selected = duration.id === selectedDurationId;
                    return (
                      <button
                        key={duration.id}
                        type="button"
                        className={`gateNine__duration${selected ? " gateNine__duration--selected" : ""}`}
                        onClick={() => setSelectedDurationId(duration.id)}
                      >
                        {duration.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <label className="gateNine__upgrade">
                <input
                  type="checkbox"
                  checked={washroomUpgrade}
                  onChange={(event) => setWashroomUpgrade(event.target.checked)}
                />
                <span>
                  Private washroom upgrade (+{GATE_NINE_WASHROOM_UPGRADE_CREDITS}{" "}
                  credits / night · subject to availability)
                </span>
              </label>

              <div className="gateNine__bookingSummary">
                <div className="gateNine__summaryRow">
                  <span>Room</span>
                  <span>{selectedRoom?.name ?? "—"}</span>
                </div>
                <div className="gateNine__summaryRow">
                  <span>Stay</span>
                  <span>{selectedDuration?.label ?? "—"}</span>
                </div>
                {washroomUpgrade ? (
                  <div className="gateNine__summaryRow">
                    <span>Washroom upgrade</span>
                    <span>
                      +
                      {GATE_NINE_WASHROOM_UPGRADE_CREDITS *
                        (selectedDuration?.nights ?? 0)}{" "}
                      credits
                    </span>
                  </div>
                ) : null}
                <div className="gateNine__summaryRow gateNine__summaryRow--total">
                  <span>Total due</span>
                  <span>{bookingTotal} credits</span>
                </div>
              </div>

              <p className="gateNine__timeNote">{GATE_NINE_BOOKING_TIME_NOTE}</p>

              <div className="gateNine__actions">
                <button
                  type="button"
                  className="gateNine__btn gateNine__btn--enter"
                  disabled
                  title="Payment and check-in flow coming soon"
                >
                  PAY &amp; CHECK IN
                </button>
                <button
                  type="button"
                  className="gateNine__btn gateNine__btn--leave"
                  onClick={handleBackToDesk}
                >
                  BACK TO DESK
                </button>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
