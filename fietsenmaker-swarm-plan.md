# Fietsenmaker — Swarm Development Plan

## Huidige staat

Eén React component (`fietsenmaker.jsx`) met drie mini-games voor groep 2/3 (leeftijd 5-7):

- **Woordenwiel** — woord-plaatje matching (8 rondes, 3 opties)
- **Rekenrace** — tellen, optellen, aftrekken met emoji (8 rondes, oplopende moeilijkheid)
- **Letterbouwer** — woord spellen door letters in volgorde te tikken (6 rondes)

Stack: React met inline styles, Web Audio API, Quicksand + Fredoka One fonts, Toca Boca-geïnspireerd design. Geen externe state, geen router, geen build tooling.

## Doel

Van single-file prototype naar een modulair, uitbreidbaar leerspel dat jonge kinderen langere tijd boeit. Geschikt voor iteratieve ontwikkeling via parallelle Claude Code sessies.

---

## Architectuur na refactor

```
fietsenmaker/
├── src/
│   ├── App.jsx              # Router + globale state
│   ├── data/
│   │   ├── woorden.js       # Woordenlijst met emoji, hints, categorieën
│   │   ├── sounds.js        # Web Audio synthese
│   │   └── achievements.js  # Badge/medaille definities
│   ├── components/
│   │   ├── HomeScreen.jsx
│   │   ├── GameShell.jsx     # Gedeelde layout: topbar, progress, confetti
│   │   ├── Confetti.jsx
│   │   ├── Stars.jsx
│   │   └── ProgressBar.jsx
│   ├── games/
│   │   ├── Woordenwiel.jsx
│   │   ├── Rekenrace.jsx
│   │   ├── Letterbouwer.jsx
│   │   ├── Kleurenmixer.jsx    # nieuw
│   │   ├── Vormenrit.jsx       # nieuw
│   │   └── Rijmfiets.jsx       # nieuw
│   ├── hooks/
│   │   ├── useGameRounds.js  # Gedeelde game-loop logica
│   │   ├── useSound.js
│   │   └── useProgress.js    # localStorage voortgang
│   └── styles/
│       ├── theme.js          # Kleuren, fonts, spacing tokens
│       └── animations.js     # Keyframes als JS constanten
├── public/
│   └── index.html
├── package.json
├── CLAUDE.md                 # Instructies voor Claude Code sessies
└── README.md
```

---

## Swarm werkstromen

Elke werkstroom is een onafhankelijke Claude Code sessie die parallel kan draaien. Afhankelijkheden staan aangegeven.

### Stroom 1: Fundament (eerst uitvoeren)

**Doel:** Refactor single-file naar modulaire structuur.

Taken:
1. Project scaffolding met Vite + React
2. Splits `fietsenmaker.jsx` in losse bestanden volgens architectuur hierboven
3. Extracteer `useGameRounds` hook: gedeelde state-machine voor ronde, score, feedback, confetti timing
4. Maak `GameShell` wrapper: topbar, progress, confetti, done-screen als herbruikbaar component
5. Verplaats theme tokens naar `theme.js`
6. Schrijf `CLAUDE.md` met project conventions

**Output:** Werkend project met `npm run dev`, identieke functionaliteit als prototype.

### Stroom 2: Voortgang & motivatie

**Afhankelijk van:** Stroom 1 (project structuur)

**Doel:** Kinderen willen terugkomen.

Taken:
1. `useProgress` hook met localStorage: sterren per game, totaal, sessie-historie
2. Homescreen uitbreiden: sterren-teller per game, "vandaag gespeeld" indicator
3. Medaille-systeem: eerste keer 8/8, 3 dagen achtereen, 50 sterren totaal, etc.
4. Medaille-animatie bij unlock (groter dan confetti, met geluid)
5. Simpele "garage" scherm: verzamelde medailles bekijken

**Output:** Persistente voortgang, 8-10 medailles, garage-scherm.

### Stroom 3: Nieuwe game — Kleurenmixer

**Afhankelijk van:** Stroom 1 (GameShell, useGameRounds)

**Doel:** Visueel-creatieve game over kleuren mengen.

Concept:
- Toon een doelkleur (bv. oranje, groen, paars)
- Kind kiest twee basiskleuren om te "mengen" (rood + geel = oranje)
- Visuele mix-animatie (twee verfdruppels die samenvloeien)
- 6 rondes, oplopend: primair → secundair → moeilijkere combinaties
- Thema: "Verf de fiets!" — resultaatkleur verschijnt op een fiets-silhouet

**Output:** Werkende `Kleurenmixer.jsx`, geregistreerd in homescreen.

### Stroom 4: Nieuwe game — Vormenrit

**Afhankelijk van:** Stroom 1 (GameShell, useGameRounds)

**Doel:** Ruimtelijk inzicht en vormen herkennen.

Concept:
- Toon een voertuig opgebouwd uit geometrische vormen (fiets = 2 cirkels + driehoek + rechthoek)
- Kind moet de juiste vormen selecteren om het voertuig "na te bouwen"
- Drag-and-drop of tap-to-place interactie
- 6 rondes met steeds complexere voertuigen
- Bonus: tangram-achtige puzzel als extra uitdaging

**Output:** Werkende `Vormenrit.jsx`, geregistreerd in homescreen.

### Stroom 5: Nieuwe game — Rijmfiets

**Afhankelijk van:** Stroom 1 (GameShell, useGameRounds, woorden.js)

**Doel:** Fonemisch bewustzijn (rijmen) — belangrijk voor groep 2/3.

Concept:
- Toon een woord + emoji (bv. "fiets" 🚲)
- Kind kiest welk woord rijmt uit 3 opties (bv. "niets" ✓, "auto" ✗, "boot" ✗)
- Rijmwoorden deels uit de bestaande WOORDEN lijst, deels nieuw
- 8 rondes, hints beschikbaar ("luister naar het einde van het woord")
- Extra: na goed antwoord kort rijmpje tonen ("fiets rijmt op niets!")

Rijmdata toevoegen aan `woorden.js`:
```js
{ woord: "fiets", rijmt: ["niets", "liets"], ... }
{ woord: "wiel", rijmt: ["kiel", "veel"], ... }
```

**Output:** Werkende `Rijmfiets.jsx` + uitgebreide woordendata.

### Stroom 6: Polish & toegankelijkheid

**Afhankelijk van:** Stroom 1 + minstens één game-stroom

**Doel:** Productiekwaliteit.

Taken:
1. Touch optimalisatie: grotere tap targets (min 48px), geen hover-afhankelijkheid
2. Reduced motion: `prefers-reduced-motion` media query respecteren
3. Keyboard navigatie: focus states, enter/space voor knoppen
4. Screen reader basics: aria-labels op emoji, role="button" waar nodig
5. Performance: React.memo op zware componenten, lazy loading per game
6. PWA manifest + service worker voor offline gebruik (belangrijk voor in de auto)

**Output:** Gepolijst, toegankelijk, offline-capabel.

---

## CLAUDE.md template

```markdown
# Fietsenmaker — Claude Code Instructions

## Project
Educatief React-spel voor kinderen van 5-7 jaar (groep 2/3).
Thema: fietsen, voertuigen, de fietsenmaker-werkplaats.

## Stack
- Vite + React 18
- Inline styles (geen CSS modules, geen Tailwind)
- Web Audio API voor geluiden (geen audio bestanden)
- localStorage voor voortgang
- Nederlands — alle UI-tekst in het Nederlands

## Design principes
- Toca Boca-stijl: warm, rond, uitnodigend
- Fonts: Quicksand (UI) + Fredoka One (titels)
- Kleuren: warm geel (#FFF8E7 achtergrond), blauw (#45B7D1), oranje (#FF9F43), paars (#A855F7)
- Grote tap targets (min 48x48px)
- Altijd positieve feedback, ook bij fout antwoord
- Animaties: popIn, slideUp, bounce, confetti bij goed antwoord

## Game conventies
- Gebruik `useGameRounds` hook voor game-loop
- Gebruik `GameShell` voor layout (topbar, progress, done-screen)
- Elke game exporteert: `({ onBack, onScore }) => JSX`
- Rondes: 6-8 per sessie
- Moeilijkheid: geleidelijk oplopend binnen sessie
- Score = aantal goed (niet penalties)

## Bestandsconventies
- Componenten: PascalCase.jsx
- Hooks: useCamelCase.js
- Data: camelCase.js
- Geen TypeScript (keep it simple)

## Test
- `npm run dev` moet werken
- Test elke game: start, speel alle rondes, terug naar home
- Check dat sterren correct optellen
```

---

## Prioritering

| Prio | Stroom | Geschatte effort | Impact |
|------|--------|-----------------|--------|
| 1 | Fundament | 1 sessie | Basis voor alles |
| 2 | Rijmfiets | 1 sessie | Hoge leerdoelwaarde voor groep 2 |
| 3 | Voortgang & motivatie | 1 sessie | Terugkeerwaarde |
| 4 | Kleurenmixer | 1 sessie | Visueel aantrekkelijk, ander type leren |
| 5 | Vormenrit | 1-2 sessies | Complexere interactie (drag) |
| 6 | Polish | 1 sessie | PWA + toegankelijkheid |

## Hoe te gebruiken met Claude Code

Start elke stroom als aparte sessie:

```bash
# Stroom 1: Fundament
claude "Refactor fietsenmaker.jsx naar modulair Vite+React project. Zie fietsenmaker-swarm-plan.md, Stroom 1."

# Stroom 3: Kleurenmixer (na stroom 1)
claude "Bouw de Kleurenmixer game voor Fietsenmaker. Zie fietsenmaker-swarm-plan.md, Stroom 3."
```

Na elke sessie: test met `npm run dev`, commit, en start de volgende.
