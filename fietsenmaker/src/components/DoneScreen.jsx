import Confetti from "./Confetti";
import Stars from "./Stars";
import { S } from "../styles/theme";

export default function DoneScreen({ emoji, score, total, onBack }) {
  const stars = Math.ceil((score / total) * 5);

  return (
    <div style={S.gc}>
      <Confetti active={true} />
      <div style={{ ...S.card, textAlign: "center", animation: "popIn 0.5s ease" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
        <h2 style={S.gt}>Klaar!</h2>
        <p data-speak={`Klaar! ${score} van de ${total} goed!`} style={{ fontSize: 22, color: "#555", margin: "12px 0" }}>
          <strong>{score}</strong> van de <strong>{total}</strong> goed!
        </p>
        <Stars count={stars} />
        <button
          style={{ ...S.btn, ...S.btnP, marginTop: 24 }}
          onClick={onBack}
        >
          {"\ud83c\udfe0"} Terug naar de winkel
        </button>
      </div>
    </div>
  );
}
