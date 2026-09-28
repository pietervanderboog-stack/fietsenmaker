import ProgressBar from "./ProgressBar";
import { S } from "../styles/theme";
import { speakScreen, speechSupported } from "../data/speech";

export default function TopBar({ onBack, current, total, score, color }) {
  return (
    <div style={S.topBar}>
      <button style={S.backBtn} onClick={onBack}>
        {"←"} Terug
      </button>
      <ProgressBar current={current} total={total} color={color} />
      {speechSupported && (
        <button
          style={{ ...S.backBtn, padding: "8px 12px", fontSize: 20 }}
          onClick={speakScreen}
          aria-label="Lees voor"
        >
          {"🔊"}
        </button>
      )}
      <span style={S.scoreTag}>{"⭐"} {score}</span>
    </div>
  );
}
