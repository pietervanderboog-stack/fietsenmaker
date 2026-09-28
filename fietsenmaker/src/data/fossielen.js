// Skeletons for FossielPuzzel, drawn in a 320×200 viewBox, facing right.
// Each bone has its own shape so the dashed slot on the skeleton shows
// exactly which bone goes there. `box` = [x, y, w, h] for the tray preview.
export const SKELETTEN = [
  {
    naam: "T-Rex",
    delen: [
      { id: "schedel", label: "schedel", box: [218, 32, 82, 56],
        d: "M226 34 L282 34 Q298 34 298 50 L298 60 L276 60 L276 66 L296 66 L296 74 Q296 86 282 86 L236 86 Q220 86 220 70 L220 42 Q220 34 226 34 Z M246 46 a6 6 0 1 0 0.1 0 Z" },
      { id: "nek", label: "nek", box: [204, 58, 28, 40],
        d: "M206 66 L226 60 L230 84 L212 96 Z" },
      { id: "ribben", label: "ribben", box: [110, 64, 106, 80],
        d: "M120 84 Q165 64 210 88 Q214 118 190 132 Q150 142 120 124 Q108 104 120 84 Z" },
      { id: "staart", label: "staart", box: [16, 90, 108, 40],
        d: "M122 92 Q70 92 18 128 Q74 116 122 118 Z" },
      { id: "poot", label: "poot", box: [138, 116, 36, 62],
        d: "M140 118 L164 118 L160 160 L172 176 L140 176 L148 160 Z" },
      { id: "armpje", label: "armpje", box: [192, 108, 30, 22],
        d: "M196 110 L214 116 L220 128 L212 126 L208 120 L194 118 Z" },
    ],
  },
  {
    naam: "Langnek",
    delen: [
      { id: "schedel", label: "schedel", box: [250, 16, 50, 24],
        d: "M258 18 L286 18 Q298 18 298 30 L298 36 L262 38 Q252 36 252 28 Q252 18 258 18 Z M268 24 a3 3 0 1 0 0.1 0 Z" },
      { id: "nek", label: "lange nek", box: [236, 32, 36, 82],
        d: "M238 110 Q244 60 256 34 L270 38 Q262 70 262 112 Z" },
      { id: "ribben", label: "ribben", box: [102, 72, 156, 82],
        d: "M110 100 Q170 70 250 98 Q258 128 230 142 Q170 152 118 138 Q100 120 110 100 Z" },
      { id: "staart", label: "staart", box: [12, 108, 104, 44],
        d: "M112 110 Q60 116 14 150 Q66 138 114 130 Z" },
      { id: "voorpoot", label: "voorpoot", box: [214, 134, 26, 52],
        d: "M218 136 L238 136 L236 184 L216 184 Z" },
      { id: "achterpoot", label: "achterpoot", box: [124, 130, 34, 56],
        d: "M128 132 L156 132 L150 184 L126 184 Z" },
    ],
  },
  {
    naam: "Triceratops",
    delen: [
      { id: "schedel", label: "schedel met hoorns", box: [228, 42, 78, 68],
        d: "M232 70 L276 62 L304 44 L290 70 L300 72 L296 98 L270 108 L240 104 Q228 92 232 70 Z M258 78 a5 5 0 1 0 0.1 0 Z" },
      { id: "kraag", label: "kraag", box: [206, 40, 42, 74],
        d: "M214 48 Q240 40 246 70 Q244 104 222 112 Q206 90 214 48 Z" },
      { id: "ribben", label: "ribben", box: [92, 68, 138, 84],
        d: "M100 90 Q160 66 222 90 Q228 126 200 140 Q150 150 104 134 Q90 112 100 90 Z" },
      { id: "staart", label: "staart", box: [20, 102, 86, 34],
        d: "M102 104 Q60 108 22 134 Q64 126 104 124 Z" },
      { id: "voorpoot", label: "voorpoot", box: [188, 130, 26, 48],
        d: "M192 132 L212 132 L210 176 L190 176 Z" },
      { id: "achterpoot", label: "achterpoot", box: [114, 126, 34, 52],
        d: "M118 128 L146 128 L140 176 L116 176 Z" },
    ],
  },
];
