// Voorlezen via de Web Speech API (nl-NL), zodat kinderen die nog niet
// (goed) lezen elke opdracht kunnen horen.
//
// Gebruik in JSX: zet `data-speak` op een element. De SpeechObserver in
// App leest het voor zodra het verschijnt of de tekst verandert.
//   <p data-speak style={S.prompt}>Wat is zwaarder?</p>
//   <p data-speak="Welke letter hoort bij appel?">Welke letter hoort bij 🍎?</p>
// Een niet-lege waarde van data-speak wordt voorgelezen in plaats van de tekst.

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
const STORAGE_KEY = "fietsenmaker-spraak";

let voice = null;
let muted = readMuted();
const listeners = new Set();

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "uit";
  } catch {
    return false;
  }
}

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("nl"));
  // Prefer Netherlands Dutch over Flemish, and natural/online voices over robotic ones
  const score = (v) =>
    (v.lang.toLowerCase() === "nl-nl" ? 2 : 0) +
    (/natural|online|google|xander|claire|ellen|fenna|colette/i.test(v.name) ? 1 : 0);
  voice = voices.sort((a, b) => score(b) - score(a))[0] || null;
}

if (synth) {
  pickVoice();
  synth.addEventListener?.("voiceschanged", pickVoice);
}

export const speechSupported = !!synth;

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "uit" : "aan");
  } catch {
    // Private mode: the setting just won't persist
  }
  if (value) synth?.cancel();
  listeners.forEach((fn) => fn(value));
}

export function onMutedChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Emoji would be read as "rood gezicht emoji" — strip them
function clean(text) {
  return text
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}‍️]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function speak(text, { force = false } = {}) {
  if (!synth || (muted && !force)) return;
  const t = clean(text || "");
  if (!t) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(t);
  u.lang = "nl-NL";
  if (voice) u.voice = voice;
  u.rate = 0.9;
  u.pitch = 1.1;
  synth.speak(u);
}

// Speaks one line and resolves when done. Falls back to a timer when speech
// is muted/unsupported, so sequences (like the theater show) keep their pace.
export function speakAndWait(text, fallbackMs = 2200) {
  return new Promise((resolve) => {
    const t = clean(text || "");
    if (!synth || muted || !t) {
      setTimeout(resolve, fallbackMs);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "nl-NL";
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.pitch = 1.1;
    // Some browsers never fire onend — don't hang the show
    const guard = setTimeout(resolve, Math.max(fallbackMs, t.length * 120));
    u.onend = () => {
      clearTimeout(guard);
      setTimeout(resolve, 400);
    };
    synth.speak(u);
  });
}

export function textOf(el) {
  // React renders a bare `data-speak` as "true"
  const attr = el.getAttribute("data-speak");
  return attr && attr !== "true" ? attr : el.innerText || el.textContent || "";
}

// Reads every [data-speak] element currently on screen, in DOM order
export function speakScreen() {
  const texts = [...document.querySelectorAll("[data-speak]")].map(textOf).filter(Boolean);
  speak(texts.join(". "), { force: true });
}
