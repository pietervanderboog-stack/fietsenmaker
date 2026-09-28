import { useState, useEffect } from "react";
import { VORMEN_RONDES, VORM_KLEUREN } from "../data/vormen";
import { useGameRounds } from "../hooks/useGameRounds";
import { CHEERS, pick, shuffle } from "../data/woorden";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const R = 6;
const COLOR = "#55efc4";
const K = VORM_KLEUREN;

/* ── Shape icon (SVG) used in option buttons ──────────────────── */
function ShapeIcon({ type, size = 26 }) {
  const k = K[type] ?? "#ccc";
  if (type === "cirkel")
    return <svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={k} /></svg>;
  if (type === "vierkant")
    return <svg width={size} height={size}><rect x={1} y={1} width={size - 2} height={size - 2} rx={2} fill={k} /></svg>;
  if (type === "rechthoek")
    return <svg width={size * 1.7} height={size}><rect x={1} y={size * 0.25} width={size * 1.7 - 2} height={size * 0.5} rx={2} fill={k} /></svg>;
  if (type === "driehoek")
    return <svg width={size} height={size}><polygon points={`${size / 2},2 ${size - 1},${size - 1} 1,${size - 1}`} fill={k} /></svg>;
  return null;
}

/* ── SVG vehicle components ───────────────────────────────────── */
function FietsVoertuig() {
  return (
    <svg viewBox="0 0 220 148" width="220" height="148">
      {/* Frame (driehoek) */}
      <polygon points="52,114 110,46 168,114" fill={K.driehoek} opacity="0.85" />
      {/* Stuur (rechthoek) */}
      <rect x="142" y="26" width="46" height="13" rx="6" fill={K.rechthoek} />
      {/* Zadel (rechthoek) */}
      <rect x="83" y="41" width="42" height="12" rx="5" fill={K.rechthoek} />
      {/* Wiel links (cirkel) */}
      <circle cx="52" cy="114" r="30" fill={K.cirkel} stroke="#0984e3" strokeWidth="5" />
      {/* Wiel rechts (cirkel) */}
      <circle cx="168" cy="114" r="30" fill={K.cirkel} stroke="#0984e3" strokeWidth="5" />
    </svg>
  );
}

function AutoVoertuig() {
  return (
    <svg viewBox="0 0 220 128" width="220" height="128">
      {/* Carrosserie (rechthoek) */}
      <rect x="8" y="56" width="204" height="52" rx="10" fill={K.rechthoek} />
      {/* Dak (rechthoek) */}
      <rect x="46" y="22" width="128" height="42" rx="14" fill="#8e7ff0" />
      {/* Wiel links (cirkel) */}
      <circle cx="57" cy="113" r="23" fill={K.cirkel} stroke="#0984e3" strokeWidth="4" />
      {/* Wiel rechts (cirkel) */}
      <circle cx="163" cy="113" r="23" fill={K.cirkel} stroke="#0984e3" strokeWidth="4" />
    </svg>
  );
}

function BusVoertuig() {
  return (
    <svg viewBox="0 0 220 130" width="220" height="130">
      {/* Body (rechthoek) */}
      <rect x="8" y="14" width="204" height="96" rx="10" fill={K.rechthoek} />
      {/* Raam 1 (vierkant) */}
      <rect x="22" y="27" width="46" height="40" rx="6" fill={K.vierkant} />
      {/* Raam 2 (vierkant) */}
      <rect x="87" y="27" width="46" height="40" rx="6" fill={K.vierkant} />
      {/* Raam 3 (vierkant) */}
      <rect x="152" y="27" width="46" height="40" rx="6" fill={K.vierkant} />
      {/* Wiel links (cirkel) */}
      <circle cx="55" cy="114" r="21" fill={K.cirkel} stroke="#0984e3" strokeWidth="4" />
      {/* Wiel rechts (cirkel) */}
      <circle cx="165" cy="114" r="21" fill={K.cirkel} stroke="#0984e3" strokeWidth="4" />
    </svg>
  );
}

function RaketVoertuig() {
  return (
    <svg viewBox="0 0 220 162" width="220" height="162">
      {/* Body (rechthoek) */}
      <rect x="80" y="42" width="60" height="88" rx="8" fill={K.rechthoek} />
      {/* Punt (driehoek) */}
      <polygon points="80,42 140,42 110,6" fill={K.driehoek} />
      {/* Vleugel links (driehoek) */}
      <polygon points="80,82 80,130 44,130" fill={K.driehoek} />
      {/* Vleugel rechts (driehoek) */}
      <polygon points="140,82 140,130 176,130" fill={K.driehoek} />
      {/* Vlam */}
      <ellipse cx="110" cy="138" rx="15" ry="18" fill="#FF9F43" opacity="0.9" />
      <ellipse cx="110" cy="146" rx="9" ry="12" fill="#FFD93D" />
    </svg>
  );
}

function TreinVoertuig() {
  return (
    <svg viewBox="0 0 220 128" width="220" height="128">
      {/* Wagon 1 (rechthoek) */}
      <rect x="8" y="24" width="94" height="72" rx="10" fill={K.rechthoek} />
      {/* Wagon 2 (rechthoek) */}
      <rect x="118" y="24" width="94" height="72" rx="10" fill="#8e7ff0" />
      {/* Verbinding */}
      <rect x="102" y="48" width="16" height="12" rx="3" fill="#636e72" />
      {/* Wielen wagon 1 */}
      <circle cx="38" cy="103" r="18" fill={K.cirkel} stroke="#0984e3" strokeWidth="4" />
      <circle cx="87" cy="103" r="18" fill={K.cirkel} stroke="#0984e3" strokeWidth="4" />
      {/* Wielen wagon 2 */}
      <circle cx="133" cy="103" r="18" fill={K.cirkel} stroke="#0984e3" strokeWidth="4" />
      <circle cx="182" cy="103" r="18" fill={K.cirkel} stroke="#0984e3" strokeWidth="4" />
    </svg>
  );
}

function BootVoertuig() {
  return (
    <svg viewBox="0 0 220 148" width="220" height="148">
      {/* Romp (rechthoek) */}
      <rect x="18" y="96" width="184" height="40" rx="20" fill={K.rechthoek} />
      {/* Mast */}
      <line x1="110" y1="96" x2="110" y2="16" stroke="#636e72" strokeWidth="5" />
      {/* Zeil (driehoek) */}
      <polygon points="110,20 110,90 172,60" fill={K.driehoek} />
    </svg>
  );
}

const VEHICLES = {
  fiets: FietsVoertuig,
  auto: AutoVoertuig,
  bus: BusVoertuig,
  raket: RaketVoertuig,
  trein: TreinVoertuig,
  boot: BootVoertuig,
};

/* ── Shape color legend ───────────────────────────────────────── */
function Legenda() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 14,
        flexWrap: "wrap",
        margin: "4px 0 12px",
      }}
    >
      {Object.entries(K).map(([naam, kleur]) => (
        <div
          key={naam}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: "#aaa",
            fontWeight: 600,
          }}
        >
          <ShapeIcon type={naam} size={14} />
          <span>{naam}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main game component ──────────────────────────────────────── */
export default function Vormenrit({ onBack, onScore }) {
  const [hint, setHint] = useState(false);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: R,
    onDone: onScore,
    delay: 1600,
  });

  useEffect(() => {
    setHint(false);
  }, [round]);

  // New order and answer positions every session
  const [rondes] = useState(() => shuffle(VORMEN_RONDES).map((r) => ({ ...r, opties: shuffle(r.opties) })));
  const cur = rondes[round];

  if (!cur && !done) return null;
  if (done) {
    return <DoneScreen emoji={"\ud83d\udd37"} score={score} total={R} onBack={onBack} />;
  }

  const VehicleComponent = VEHICLES[cur.vehicleId];

  const doAnswer = (a) => {
    const ok = a === cur.antwoord;
    handleAnswer(ok, ok ? pick(CHEERS) : `Het antwoord was: ${cur.antwoord}`);
  };

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={R} score={score} color={COLOR} />

      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>{cur.vraag}</p>

        {/* Vehicle illustration */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "8px 0 4px",
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.1))",
            animation: "popIn 0.4s ease",
          }}
        >
          <VehicleComponent />
        </div>

        <Legenda />

        {/* Hint */}
        {!hint && !ans && (
          <button style={S.hintBtn} onClick={() => setHint(true)}>
            {"\ud83d\udca1"} Hint
          </button>
        )}
        {hint && <p style={S.hintTxt}>{cur.hint}</p>}

        {/* Options */}
        <div style={S.opts}>
          {cur.opties.map((o) => (
            <button
              key={String(o)}
              disabled={ans}
              onClick={() => doAnswer(o)}
              style={{
                ...S.optBtn,
                ...(fb && o === cur.antwoord ? S.optOk : {}),
                ...(fb && o !== cur.antwoord ? { opacity: 0.4 } : {}),
              }}
            >
              {cur.type === "shape" ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <ShapeIcon type={o} size={28} />
                  {o}
                </span>
              ) : (
                o
              )}
            </button>
          ))}
        </div>

        {fb && (
          <div data-speak
            style={{
              ...S.fbBub,
              backgroundColor: fb.ok ? "#d4edda" : "#fff3cd",
              color: fb.ok ? "#155724" : "#856404",
            }}
          >
            {fb.t}
          </div>
        )}
      </div>
    </div>
  );
}
