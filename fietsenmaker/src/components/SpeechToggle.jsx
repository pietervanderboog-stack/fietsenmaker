import { useEffect, useState } from "react";
import { isMuted, setMuted, onMutedChange, speak, speechSupported } from "../data/speech";

// Voorlezen aan/uit — for parents; the setting is remembered per device
export default function SpeechToggle({ style }) {
  const [muted, setLocal] = useState(isMuted());
  useEffect(() => onMutedChange(setLocal), []);
  if (!speechSupported) return null;

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    if (!next) speak("Voorlezen staat aan");
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Voorlezen aanzetten" : "Voorlezen uitzetten"}
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "none",
        borderRadius: 16,
        width: 48,
        height: 44,
        fontSize: 22,
        cursor: "pointer",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        ...style,
      }}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
