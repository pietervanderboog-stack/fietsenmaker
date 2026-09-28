# Fietsenmaker — Claude Code Instructions

## Project
Educatief React-spel voor kinderen van 5-7 jaar (groep 2/3).
Thema: fietsen, voertuigen, de fietsenmaker-werkplaats.
Gemaakt voor mijn kinderen. Noem nooit hun namen in code, content of commits — de repo is publiek.

## Stack
- Vite + React 18
- Inline styles (geen CSS modules, geen Tailwind)
- Web Audio API voor geluiden (geen audio bestanden)
- localStorage voor voortgang (nog te bouwen — Stroom 2)
- Nederlands — alle UI-tekst in het Nederlands

## Bestandsstructuur
```
src/
  App.jsx              # Router + globale state
  data/
    woorden.js         # WOORDEN, CHEERS, OOPS, shuffle, pick, pickN
    sounds.js          # playSound(type) — type: correct|wrong|click|win
  styles/
    theme.js           # S object — gedeelde inline stijlen
    animations.js      # KF string — CSS keyframes
  components/
    HomeScreen.jsx
    Confetti.jsx
    Stars.jsx
    ProgressBar.jsx
    TopBar.jsx
    DoneScreen.jsx
  hooks/
    useGameRounds.js   # Gedeelde game-loop voor multiple-choice games
  games/
    Woordenwiel.jsx
    Rekenrace.jsx
    Letterbouwer.jsx
```

## Design principes
- Toca Boca-stijl: warm, rond, uitnodigend
- Fonts: Quicksand (UI) + Fredoka One (titels) — geladen via Google Fonts in index.html
- Kleuren: warm geel (#FFF8E7 achtergrond), blauw (#45B7D1), oranje (#FF9F43), paars (#A855F7)
- Grote tap targets (min 48x48px)
- Altijd positieve feedback, ook bij fout antwoord
- Animaties: popIn, slideUp, bounce, confetti bij goed antwoord

## Game conventies
- Gebruik `useGameRounds` hook voor multiple-choice game-loop
- Gebruik `GameShell`-componenten (TopBar, DoneScreen, Confetti) voor layout
- Elke game exporteert als default: `({ onBack, onScore }) => JSX`
- `onScore(finalScore)` aanroepen bij afronden
- Rondes: 6-8 per sessie
- Moeilijkheid: geleidelijk oplopend binnen sessie
- Score = aantal goed (geen penalties)

## Voorlezen
- Zet `data-speak` op elk element dat voorgelezen moet worden (opdracht, feedback). `SpeechObserver` (in App) leest het voor zodra het verschijnt of verandert.
- Staat er een emoji of een verkapt antwoord in de tekst, geef dan een eigen tekst mee: `data-speak={`Welke letter hoort bij ${naam}?`}`.
- De 🔊-knop in `TopBar` leest het hele scherm opnieuw voor. `SpeechToggle` op de kaart zet het aan of uit (per apparaat).

## useGameRounds API
```js
const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
  total: 8,        // aantal rondes
  onDone: onScore, // callback met finalScore
  delay: 1600,     // ms voor auto-advance
});
handleAnswer(isCorrect, feedbackText);
```
Letterbouwer beheert eigen state (letter-voor-letter interactie).

## Nieuwe game toevoegen
1. Maak `src/games/NieuweGame.jsx`
2. Voeg toe aan `GAMES` array in `HomeScreen.jsx`
3. Voeg route toe in `App.jsx`

## Test
- `npm run check:layout` — bereikbaarheid van deuren/exits/spawns met de echte Player-logica (verplicht na elke layout-wijziging)
- `npm run shots [-- gameId ...]` — headless screenshots van alle werelden met hitboxen → `debug/`
- `npm run smoke [-- gameId ...]` — 'aap'-test: tikt willekeurig tot elk spel klaar is; meldt crashes en spellen die niet eindigen
- URL-params: `?debug=1` (hitboxen), `?world=launchpad`, `?game=theater`, `?launch=1` (raketlancering), `?touch=1` (joystick op desktop)
- `npm run dev` voor ontwikkeling
- Test elke game: start → speel alle rondes → done screen → terug naar home
- `npm run build` voor productie check
