# Sprites voor wandelaars, hardlopers en dieren

De NPC's staan al in `src/data/npcs.js`. Zodra het sprite-bestand bestaat, lopen ze mee. Er hoeft geen code aangepast te worden.

## Status (28 sept 2026)

Alle zes zijn gemaakt en staan in het spel. De originelen van Gemini staan in `sprites unedited/npc-*-gemini.*`.

Wat werkte: de bestaande Gemini-chat "Prompt 1: Launchpad…" gebruiken. Daar staan de achtergronden en de raket-sprite al in, dus je hoeft geen stijlreferentie te uploaden. Gemini geeft geen 4×4, maar 6 kolommen (en soms 8 in de rij van voren en de rij van achteren), in de verhouding 1024×559. Bij de "naar rechts"-rij kijkt de figuur vaak afwisselend links en rechts. Zet om met:

```
python scripts/prepare-sprite.py raw.png npc-naam --auto --mirror-right [--height=18]
```

`--auto` zoekt per rij de losse figuren, `--mirror-right` maakt de rechterrij van de gespiegelde linkerrij, en `--height` bepaalt de grootte (mensen 28, koe 24, dino 22, hond 18, kip 16).

## Werkwijze

1. Open Gemini (Nano Banana) en voeg `public/sprites/cyclist.png` toe als **stijlreferentie**. Die is klein, dus vergroot hem eerst: `python scripts/prepare-sprite.py --preview public/sprites/cyclist.png` maakt `debug/cyclist-ref.png` op 1024×1024.
2. Genereer **één figuur per afbeelding**. Meerdere figuren in één plaatje raken bij Gemini altijd scheef uitgelijnd.
3. Sla het resultaat op en zet het om:
   ```
   python scripts/prepare-sprite.py pad/naar/gemini.png npc-hardloper
   ```
   Het script knipt het raster, maakt magenta transparant, schaalt elk frame naar 32×32, zet de voeten op één lijn en schrijft `public/sprites/npc-hardloper.png`. Daarnaast maakt het een vergrote controleplaat in `debug/`.
4. Controleer die plaat, en ververs dan het spel.

Bestandsnamen die het spel verwacht: `npc-wandelaar`, `npc-hardloper`, `npc-hond`, `npc-kip`, `npc-koe`, `npc-babydino`.

## Basisprompt (plak dit, en vul `[FIGUUR]` en `[BEWEGING]` in)

> Pixel art sprite sheet for a top-down 2D kids' game, in exactly the same style as the attached reference image: 16-bit pixel art, bold dark outlines, bright friendly colours, three-quarter top-down view, chunky cute proportions (big head, small body).
>
> Character: [FIGUUR].
>
> Layout: a 4 × 4 grid of equal square cells on a 1024 × 1024 canvas (each cell 256 × 256). Solid flat magenta background #FF00FF everywhere, no shadows on the background, no grid lines, no text, no borders.
> - Row 1: facing down (towards the viewer), 4 frames of a [BEWEGING] cycle
> - Row 2: facing left, 4 frames of the same cycle
> - Row 3: facing right, 4 frames of the same cycle
> - Row 4: facing up (away from the viewer), 4 frames of the same cycle
>
> The character is the same size in every cell, centred horizontally, feet at the same height near the bottom of each cell, filling about 70% of the cell height. Every frame shows the whole character; nothing is cut off at the cell edges.

## Invulling per figuur

| Bestand | [FIGUUR] | [BEWEGING] |
|---|---|---|
| `npc-wandelaar` | a friendly grandmother with grey hair in a bun, a green coat and a small shopping bag | slow walking |
| `npc-hardloper` | a sporty young man with a headband, a light blue running shirt, black shorts and white running shoes | running (clear leg and arm swing) |
| `npc-hond` | a small happy brown-and-white dog with floppy ears and a red collar | trotting |
| `npc-kip` | a plump white chicken with a red comb and yellow legs | waddling walk, with small head bobs |
| `npc-koe` | a cute black-and-white Dutch dairy cow with a pink nose and a small bell | slow walking |
| `npc-babydino` | a small cute green baby T-Rex with big eyes and a cream-coloured belly | stomping walk with tiny arms |

## Als het niet goed gaat

- **Figuur niet in alle 16 vakken, of scheve rijen:** voeg toe: *"Exactly 16 poses, 4 per row, evenly spaced, same scale."*
- **Achtergrond niet egaal magenta:** voeg toe: *"Background must be a single flat colour #FF00FF, no gradient, no texture."*
- **Links en rechts zijn niet gespiegeld:** geen probleem. Het script heeft `--mirror-right` om rij 3 te vervangen door rij 2 gespiegeld.
- **Dieren van 4 poten ogen van voren vreemd:** dat is normaal bij deze kijkhoek. Kinderen zien ze vooral van opzij.
