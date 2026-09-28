// Shared dino set for the size games (DinoMaten, VoetafdrukMatch).
// Each dino gets a hue shift for variety (base emoji colours differ per
// platform, so colours are never named in text), and a fixed on-screen height `px` that
// keeps the real-world order. KIND is the reference figure ("zo groot als jij").
export const DINOS = [
  { id: "compy",   naam: "Compy",   emoji: "🦖", hue: -55,  px: 24 },
  { id: "raptor",  naam: "Raptor",  emoji: "🦖", hue: 120,  px: 36 },
  { id: "ankylo",  naam: "Ankylo",  emoji: "🦕", hue: 0,    px: 58 },
  { id: "stego",   naam: "Stego",   emoji: "🦕", hue: -85,  px: 76 },
  { id: "trex",    naam: "T-Rex",   emoji: "🦖", hue: -115, px: 100 },
  { id: "langnek", naam: "Langnek", emoji: "🦕", hue: 165,  px: 132 },
];

export const KIND = { emoji: "🧍", px: 44 };

export const dinoLabel = (d) => `de ${d.naam}`;
