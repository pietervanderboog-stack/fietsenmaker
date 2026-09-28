# Verbeterplan Fietsenmaker (sept 2026)

Uitgangspunt: commit `cc1da5c`. Elke stap is los uit te voeren en eindigt met `npm run build` + `npm run check:layout` (vanaf stap 1) + een eigen commit.

## Diagnose

**Wereldkaarten.** Ik heb de hitboxen over de achtergronden gelegd en een bereikbaarheidstest gedraaid die de echte `Player.js` gebruikt:

| Wereld | Wat de check vond | Visueel |
|---|---|---|
| Stad | Deur `kleuren` ligt 50px van deur `theater`. De verfwinkel wordt bij het theater "gepakt" | ok (handmatig gereviewd) |
| Boerderij | `PLAYER_START` (10,360) staat vast | ok |
| Dino | geen problemen | ok |
| Raketbasis | `PLAYER_START` (440,360) staat in de bomen en zit vast. `from_city_mid` staat half op het gras | Wegen kloppen grofweg. Het pad naar de raket loopt door het gras (x 150–224). Het bovenste asfalt links (x 0–198) is niet berijdbaar |
| Ruimte | – (vrij bewegen) | **Klopt niet.** De nieuwe achtergrond heeft de planeten elders: aarde ok, maan/Jupiter/tankstation/sterren/station staan op lege ruimte |

**Spellen.** Het grootste probleem zit niet in één spel: er wordt nergens iets voorgelezen (0× `speechSynthesis`). Een kind van 5 moet overal tekst lezen.

## Stappen

### Stap 1 — Layout-check als vast gereedschap
- `scripts/check-layout.mjs`: een bereikbaarheidstest (BFS met de echte `updatePlayer`). Die meldt deuren of exits die je niet bereikt, spawns die vastzitten of in een exit liggen, exits zonder koppeling en deuren die te dicht op elkaar liggen.
- `scripts/overlay.py`, of Playwright als je het echt in de browser wilt: hitboxen over de achtergrond en een PNG per wereld naar `debug/`.
- Een `?debug=1` URL-param in plaats van `DEBUG_DRAW` per bestand aanpassen. Daarmee kan Playwright headless screenshots maken van de echte game.
- Afweging: PIL is snel en exact, want de renderer tekent de achtergrond 1:1 op 480×700. Playwright test ook camera en schaal, maar is trager. Voorstel: beide, met PIL voor elke wijziging en Playwright als smoke test.

### Stap 2 — Raketbasis gelijktrekken
- `PLAYER_START` en `from_city_mid` op het asfalt zetten.
- Pad naar de raket volgen via het betonnen platform. Het bovenste asfalt eventueel doorzetten naar links.
- Check en overlay groen, daarna even zelf rondfietsen.

### Stap 3 — Ruimte opnieuw uitlijnen op de nieuwe achtergrond
- Mapping voorstel: Maan → het ringplaneetje linksboven of een echte maan, Jupiter → de grote gestreepte planeet (~240,480), Ruimtestation → het ISS rechtsboven (~375,140), Sterrenstelsel → de spiraal (~385,565), Tankstation → de nevel linksonder of de rode planeet (~118,305).
- Beslispunt voor jou: labels aanpassen aan de plaatjes, of een achtergrond kiezen die bij de labels past.
- Omdat hier geen wegen zijn, telt een "deur" onder een hemellichaam niet. De interactiezone moet het midden van het object worden (kleine renderer/Player-aanpassing voor `movementType: rocket`).

### Stap 4 — Stad: kleuren/theater loskoppelen
- De deur van de verfwinkel naar de voorkant van de PAINT-winkel of naar de zijkant verplaatsen, zodat de twee zones elkaar niet overlappen.

### Stap 5 — Voorlezen, de grootste winst over alle 23 spellen
- `speak(text)` helper met `speechSynthesis` `nl-NL`, plus een 🔊-knop in `TopBar`.
- De opdracht wordt voorgelezen bij elke nieuwe ronde, en de feedback ook.
- Afweging: browserstemmen verschillen per tablet (iPad heeft een goede NL-stem, Android soms niet). Opgenomen audio klinkt beter, maar is veel meer werk.

### Stap 6 — Dino's (de spellen die je noemde)
- **DinoMaten**: nu hebben alle emoji's dezelfde grootte, zijn 🦖 en 🦕 dubbel, en zit de grootte alleen in tekst ("Reusachtig"). Nieuw: dino's echt op schaal tekenen naast een herkenbaar ijkpunt (🚲 fiets, 🏠 huis, 🚌 bus). Vraag: "Welke dino is groter dan een bus?" of sorteren met zichtbare hoogteverschillen.
- **BotjesGraven**: nu zijn letters door elkaar gegraven, gevolgd door tekstkeuzes als "Trice" en "Dino". Dat is een anagram voor kleuters. Nieuw: graaf een botten-silhouet bloot, kies de dino uit **plaatjes**. De letters van de naam vallen daarbij *op volgorde* in vakjes eronder, als leesbonus. 6 rondes in plaats van 4.
- **VoetafdrukMatch** (kapot): 3 afdrukmaten voor 6 dino's, waardoor er dubbele goede antwoorden zijn. Nieuw: 3 opties met duidelijk verschillende afdrukken, en de Latijnse namen eruit.
- **FossielPuzzel**: alles is 🦴 met 12px labels en genummerde slots. Nieuw: een silhouet met vormslots. Ook de scoretelling repareren (3 vs 14).
- **DinoEi**: drempel "uitgekomen" gelijktrekken (5 vs 4), rondes husselen.
- Gedeelde data: één `dinos.js` met unieke visuals en `grootte` die klopt.

### Stap 7 — Theater als storyboard
- Een scène wordt een stripvakje in plaats van één emoji: achtergrondkleur + 2–3 lagen emoji (👧🌲🐺). Het tekstje eronder wordt voorgelezen (stap 5).
- Vakje 1 staat al vast als ankerpunt, het kind legt 2–4.
- 6 verhalen, eventueel oplopend van 3 naar 5 vakjes. Aan het eind speelt het complete storyboard af als mini-voorstelling (gordijn open, vakjes één voor één).
- Afweging: SVG-illustraties zien er beter uit, maar emoji-compositie is binnen een dag klaar en uit te breiden.

### Stap 7b — Raketlancering opnieuw
- Aftellen 3-2-1 dat hardop wordt uitgesproken, rook en vuur, trillende camera, wolken die voorbijschieten, overgang van blauw naar sterrenhemel, en een landing in de ruimte in plaats van een harde fade.
- Het kind drukt zelf op de grote rode knop, dat geeft eigenaarschap.

### Stap 7c — NPC's in de werelden
- Een NPC is een figuurtje dat rondloopt of stilstaat, met een tekstwolkje (dat ook wordt voorgelezen) en een hint naar een spel ("Help jij mij tellen? Ga naar de stal!").
- Per wereld 2–3 NPC's: wetenschapper op de raketbasis, boer, dino-onderzoeker, marsmannetje/astronaut in de ruimte, postbode in de stad.
- Afweging: sprites passen bij de pixel-art-stijl maar moeten gegenereerd worden. Emoji-NPC's zijn direct klaar maar vallen uit de stijl. Voorstel: eerst emoji plus een schaduw, sprites later.

### Stap 8 — Kleine bugs uit de review (één verzamelcommit)
- DierenTellen: meervoud "koeen/kipen" → veld `meervoud`. Dieren overlappen en zijn dan niet te tellen.
- PlanetenPad: Venus = Aarde in `grootte`. Planeten op schaal tekenen.
- Kleurenmixer `:192`: toont de goede kleur ook bij een foute mix.
- Rijmfiets: "diem" is geen woord, plus een rits verkeerde emoji's.
- OogstSorteren: identieke manden en een regel die ongemerkt wisselt.
- SterrenVangen: 4 rondes, sterren springen bij elke render.
- Doolhof: tekst "pijltjestoetsen" en een StrictMode-bug in de setState-updater.
- BabyVerzorgen: de hint is gelijk aan het antwoord. Taalfout "had bedje nodig".
- BoomgaardLetters: kleine letters (groep 3), Citroen/S-klank, geen Q/X/Y als afleider.
- Letterbouwer: 📏 = liniaal, niet lat. 🏫 = school, niet klas.

**Nog open → opgepakt op 28 sept (tweede ronde):
1. ✅ Aanraakbesturing: joystick op tablets/telefoons (`?touch=1` op desktop).
2. ✅ RuimtePuzzel: voorbeeld van de oplossing, husselen met een vast aantal zetten (6→18), 4 rondes.
3. ✅ Vormenrit (volgorde en antwoorden gehusseld) en ZaadjesPlanten (reeksen gegenereerd, duidelijk verschillende planten).
4. ✅ NPC's zijn nu pixel-art-fietsers en -raketten, omgekleurd uit de speler-sprites. Wandelaars, hardlopers en dieren staan klaar in `npcs.js` en verschijnen zodra hun sprite bestaat (zie `SPRITES-PROMPT.md`).
5. ⏳ De voorleesstem op de echte tablet testen.
