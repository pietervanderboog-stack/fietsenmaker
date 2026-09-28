import { useState, useEffect } from "react";

const WOORDEN = [
  { woord: "fiets", emoji: "\ud83d\udeb2", hint: "Je trapt erop" },
  { woord: "wiel", emoji: "\ud83d\udede", hint: "Het is rond" },
  { woord: "auto", emoji: "\ud83d\ude97", hint: "Heeft vier wielen" },
  { woord: "bus", emoji: "\ud83d\ude8c", hint: "Veel mensen passen erin" },
  { woord: "trein", emoji: "\ud83d\ude86", hint: "Rijdt op rails" },
  { woord: "boot", emoji: "\u26f5", hint: "Vaart op water" },
  { woord: "step", emoji: "\ud83d\udef4", hint: "Je staat erop en duwt" },
  { woord: "helm", emoji: "\u26d1\ufe0f", hint: "Beschermt je hoofd" },
  { woord: "bel", emoji: "\ud83d\udd14", hint: "Ring ring!" },
  { woord: "lamp", emoji: "\ud83d\udca1", hint: "Geeft licht" },
  { woord: "band", emoji: "\u2b55", hint: "Zit om het wiel" },
  { woord: "rem", emoji: "\u270b", hint: "Om te stoppen" },
  { woord: "slot", emoji: "\ud83d\udd12", hint: "Tegen stelen" },
  { woord: "kaart", emoji: "\ud83d\uddfa\ufe0f", hint: "Om de weg te vinden" },
  { woord: "weg", emoji: "\ud83d\udee3\ufe0f", hint: "Je rijdt erop" },
  { woord: "brug", emoji: "\ud83c\udf09", hint: "Over het water" },
  { woord: "pomp", emoji: "\ud83d\udca8", hint: "Maakt de band hard" },
  { woord: "tang", emoji: "\ud83d\udd27", hint: "Gereedschap om te knijpen" },
  { woord: "zaag", emoji: "\ud83e\ude9a", hint: "Om hout te zagen" },
  { woord: "mast", emoji: "\u26f5", hint: "Zit op een zeilboot" },
];

const CHEERS = ["Goed zo! \ud83c\udf1f","Super! \u2b50","Knap hoor! \ud83c\udf89","Wauw! \ud83d\udcaa","Helemaal goed! \ud83c\udfc6","Jij bent slim! \ud83e\udde0","Fantastisch! \ud83c\udf8a","Top! \ud83d\udc4f"];
const OOPS = ["Bijna! Probeer nog eens \ud83d\udcaa","Oeps! Niet erg, nog een keer!","Dat was net niet... \ud83e\udd14","Probeer het opnieuw! \ud83d\udd04"];

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const pickN = (a, n, ex = []) => shuffle(a.filter((x) => !ex.includes(x))).slice(0, n);

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); g.gain.value = 0.15;
    if (type === "correct") {
      o.frequency.value = 523; o.type = "sine";
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      o.start(); o.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = 659; o2.type = "sine"; g2.gain.value = 0.15;
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        o2.start(); o2.stop(ctx.currentTime + 0.4);
      }, 150);
    } else if (type === "wrong") {
      o.frequency.value = 200; o.type = "triangle";
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      o.start(); o.stop(ctx.currentTime + 0.4);
    } else if (type === "click") {
      o.frequency.value = 880; o.type = "sine";
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      o.start(); o.stop(ctx.currentTime + 0.08);
    } else if (type === "win") {
      [523, 659, 784, 1047].forEach((f, i) => {
        const ow = ctx.createOscillator(); const gw = ctx.createGain();
        ow.connect(gw); gw.connect(ctx.destination);
        ow.frequency.value = f; ow.type = "sine"; gw.gain.value = 0.12;
        gw.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3 + i * 0.15);
        ow.start(ctx.currentTime + i * 0.15); ow.stop(ctx.currentTime + 0.3 + i * 0.15);
      });
    }
  } catch (e) {}
};

const Confetti = ({ active }) => {
  if (!active) return null;
  const colors = ["#FFD700","#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FF9F43","#A855F7"];
  const ps = Array.from({ length: 30 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.5,
    color: pick(colors), size: 6 + Math.random() * 8, rot: Math.random() * 360,
    round: Math.random() > 0.5,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {ps.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: -20,
          width: p.size, height: p.size, backgroundColor: p.color,
          borderRadius: p.round ? "50%" : "2px",
          transform: `rotate(${p.rot}deg)`,
          animation: `confettiFall 1.5s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
};

const Stars = ({ count, max = 5 }) => (
  <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} style={{
        fontSize: 28,
        filter: i < count ? "none" : "grayscale(1) opacity(0.3)",
        transition: "all 0.3s",
        transform: i < count ? "scale(1.1)" : "scale(0.9)",
      }}>{"\u2b50"}</span>
    ))}
  </div>
);

const ProgressBar = ({ current, total, color = "#4ECDC4" }) => (
  <div style={{ flex: 1, height: 14, borderRadius: 7, backgroundColor: "rgba(0,0,0,0.1)", overflow: "hidden" }}>
    <div style={{
      height: "100%", borderRadius: 7, width: `${(current / total) * 100}%`,
      backgroundColor: color, transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
    }} />
  </div>
);

const DoneScreen = ({ emoji, score, total, onBack }) => {
  const stars = Math.ceil((score / total) * 5);
  return (
    <div style={S.gc}>
      <Confetti active={true} />
      <div style={{ ...S.card, textAlign: "center", animation: "popIn 0.5s ease" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
        <h2 style={S.gt}>Klaar!</h2>
        <p style={{ fontSize: 22, color: "#555", margin: "12px 0" }}>
          <strong>{score}</strong> van de <strong>{total}</strong> goed!
        </p>
        <Stars count={stars} />
        <button style={{ ...S.btn, ...S.btnP, marginTop: 24 }} onClick={onBack}>
          {"\ud83c\udfe0"} Terug naar de winkel
        </button>
      </div>
    </div>
  );
};

const TopBar = ({ onBack, current, total, score, color }) => (
  <div style={S.topBar}>
    <button style={S.backBtn} onClick={onBack}>{"\u2190"} Terug</button>
    <ProgressBar current={current} total={total} color={color} />
    <span style={S.scoreTag}>{"\u2b50"} {score}</span>
  </div>
);

/* ===== WOORDENWIEL ===== */
const Woordenwiel = ({ onBack, onScore }) => {
  const R = 8;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [qs, setQs] = useState([]);
  const [hint, setHint] = useState(false);
  const [ans, setAns] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sel = shuffle(WOORDEN).slice(0, R);
    setQs(sel.map((item) => ({
      ...item,
      options: shuffle([item.woord, ...pickN(WOORDEN.map((w) => w.woord), 2, [item.woord])]),
    })));
  }, []);

  const cur = qs[round];
  const doAnswer = (a) => {
    if (ans) return; setAns(true);
    const ok = a === cur.woord;
    if (ok) {
      playSound("correct"); setFb({ ok: true, t: pick(CHEERS) });
      setScore((s) => s + 1); setConf(true);
      setTimeout(() => setConf(false), 1500);
    } else {
      playSound("wrong"); setFb({ ok: false, t: `Het was: ${cur.woord}` });
    }
    setTimeout(() => {
      if (round + 1 >= R) { setDone(true); onScore(score + (ok ? 1 : 0)); playSound("win"); }
      else { setRound((r) => r + 1); setFb(null); setAns(false); setHint(false); }
    }, 1600);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83c\udfc6"} score={score} total={R} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={R} score={score} color="#45B7D1" />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p style={S.prompt}>Welk woord hoort bij dit plaatje?</p>
        <div style={S.bigEmoji}>{cur.emoji}</div>
        {!hint && !ans && (
          <button style={S.hintBtn} onClick={() => { setHint(true); playSound("click"); }}>
            {"\ud83d\udca1"} Hint
          </button>
        )}
        {hint && <p style={S.hintTxt}>{cur.hint}</p>}
        <div style={S.opts}>
          {cur.options.map((o) => (
            <button key={o} disabled={ans} onClick={() => doAnswer(o)} style={{
              ...S.optBtn,
              ...(fb && o === cur.woord ? S.optOk : {}),
              ...(fb && o !== cur.woord ? { opacity: 0.4 } : {}),
            }}>{o}</button>
          ))}
        </div>
        {fb && <div style={{ ...S.fbBub, backgroundColor: fb.ok ? "#d4edda" : "#fff3cd", color: fb.ok ? "#155724" : "#856404" }}>{fb.t}</div>}
      </div>
    </div>
  );
};

/* ===== REKENRACE ===== */
const Rekenrace = ({ onBack, onScore }) => {
  const R = 8;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [qs, setQs] = useState([]);
  const [ans, setAns] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const vehs = WOORDEN.filter((w) => ["fiets","auto","bus","trein","boot","step"].includes(w.woord));
    const questions = Array.from({ length: R }, (_, i) => {
      const diff = i < 3 ? "count" : i < 6 ? "add" : "sub";
      const v = pick(vehs);
      if (diff === "count") {
        const c = 1 + Math.floor(Math.random() * 7);
        const mkWrong = (offset) => { let w = c + offset; return w === c || w < 1 ? c + 3 : w; };
        return {
          type: "count", vraag: `Tel de ${v.woord}en`, antwoord: c,
          opties: shuffle([c, mkWrong(1), mkWrong(-1)]),
          vis: Array.from({ length: c }, () => ({ e: v.emoji })),
        };
      } else if (diff === "add") {
        const a = 1 + Math.floor(Math.random() * 5);
        const b = 1 + Math.floor(Math.random() * 5);
        const s = a + b;
        const v2 = pick(vehs.filter((x) => x.woord !== v.woord));
        const mkW = (off) => { let w = Math.max(1, s + off); return w === s ? s + 3 : w; };
        return {
          type: "add", vraag: `${a} + ${b} = ?`, antwoord: s,
          opties: shuffle([s, mkW(1), mkW(-1)]),
          visA: Array.from({ length: a }, () => v.emoji),
          visB: Array.from({ length: b }, () => v2.emoji), a, b,
        };
      } else {
        const a = 4 + Math.floor(Math.random() * 6);
        const b = 1 + Math.floor(Math.random() * Math.min(a - 1, 4));
        const s = a - b;
        const mkW = (off) => { let w = Math.max(0, s + off); return w === s ? s + 2 : w; };
        return {
          type: "sub", vraag: `${a} - ${b} = ?`, antwoord: s,
          opties: shuffle([s, mkW(1), mkW(-1)]),
          vis: Array.from({ length: a }, (_, idx) => ({ e: v.emoji, x: idx >= a - b })),
          a, b,
        };
      }
    });
    setQs(questions);
  }, []);

  const cur = qs[round];
  const doAnswer = (a) => {
    if (ans) return; setAns(true);
    const ok = a === cur.antwoord;
    if (ok) {
      playSound("correct"); setFb({ ok: true, t: pick(CHEERS) });
      setScore((s) => s + 1); setConf(true);
      setTimeout(() => setConf(false), 1500);
    } else {
      playSound("wrong"); setFb({ ok: false, t: `Het antwoord was: ${cur.antwoord}` });
    }
    setTimeout(() => {
      if (round + 1 >= R) { setDone(true); onScore(score + (ok ? 1 : 0)); playSound("win"); }
      else { setRound((r) => r + 1); setFb(null); setAns(false); }
    }, 1800);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83c\udfaf"} score={score} total={R} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={R} score={score} color="#FF9F43" />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p style={S.prompt}>{cur.type === "count" ? "Hoeveel zijn het er?" : "Reken maar uit!"}</p>
        <h3 style={{ textAlign: "center", fontSize: 28, margin: "8px 0 16px", color: "#2d3436" }}>{cur.vraag}</h3>
        <div style={S.emojiGrid}>
          {cur.type === "count" && cur.vis.map((v, i) => (
            <span key={i} style={{ fontSize: 36, animation: `popIn 0.3s ${i * 0.05}s both` }}>{v.e}</span>
          ))}
          {cur.type === "add" && (
            <>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                {cur.visA.map((e, i) => <span key={`a${i}`} style={{ fontSize: 36, animation: `popIn 0.3s ${i * 0.05}s both` }}>{e}</span>)}
              </div>
              <span style={{ fontSize: 32, margin: "0 8px", color: "#FF9F43", fontWeight: 800 }}>+</span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                {cur.visB.map((e, i) => <span key={`b${i}`} style={{ fontSize: 36, animation: `popIn 0.3s ${(i + cur.a) * 0.05}s both` }}>{e}</span>)}
              </div>
            </>
          )}
          {cur.type === "sub" && cur.vis.map((v, i) => (
            <span key={i} style={{
              fontSize: 36, animation: `popIn 0.3s ${i * 0.05}s both`,
              opacity: v.x ? 0.25 : 1, textDecoration: v.x ? "line-through" : "none",
            }}>{v.e}</span>
          ))}
        </div>
        <div style={S.opts}>
          {cur.opties.map((o) => (
            <button key={o} disabled={ans} onClick={() => doAnswer(o)} style={{
              ...S.optBtn, fontSize: 32, letterSpacing: 0,
              ...(fb && o === cur.antwoord ? S.optOk : {}),
              ...(fb && o !== cur.antwoord ? { opacity: 0.4 } : {}),
            }}>{o}</button>
          ))}
        </div>
        {fb && <div style={{ ...S.fbBub, backgroundColor: fb.ok ? "#d4edda" : "#fff3cd", color: fb.ok ? "#155724" : "#856404" }}>{fb.t}</div>}
      </div>
    </div>
  );
};

/* ===== LETTERBOUWER ===== */
const Letterbouwer = ({ onBack, onScore }) => {
  const R = 6;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [qs, setQs] = useState([]);
  const [built, setBuilt] = useState([]);
  const [avail, setAvail] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const easy = WOORDEN.filter((w) => w.woord.length <= 5);
    const sel = shuffle(easy).slice(0, R);
    setQs(sel);
    if (sel.length > 0) {
      setAvail(shuffle(sel[0].woord.split("").map((l, i) => ({ l, id: `${l}-${i}` }))));
    }
  }, []);

  useEffect(() => {
    if (qs.length > 0 && round < R) {
      const w = qs[round].woord;
      setAvail(shuffle(w.split("").map((l, i) => ({ l, id: `${l}-${i}-${round}` }))));
      setBuilt([]);
    }
  }, [round, qs]);

  const cur = qs[round];

  const tapLetter = (lo) => {
    if (fb) return; playSound("click");
    const nb = [...built, lo];
    setBuilt(nb);
    setAvail((a) => a.filter((x) => x.id !== lo.id));
    if (nb.length === cur.woord.length) {
      const attempt = nb.map((x) => x.l).join("");
      if (attempt === cur.woord) {
        playSound("correct"); setFb({ ok: true, t: pick(CHEERS) });
        setScore((s) => s + 1); setConf(true);
        setTimeout(() => setConf(false), 1500);
        setTimeout(() => {
          if (round + 1 >= R) { setDone(true); onScore(score + 1); playSound("win"); }
          else { setRound((r) => r + 1); setFb(null); }
        }, 1600);
      } else {
        playSound("wrong"); setFb({ ok: false, t: pick(OOPS) });
        setTimeout(() => {
          setAvail(shuffle(cur.woord.split("").map((l, i) => ({ l, id: `${l}-${i}-${round}-r` }))));
          setBuilt([]); setFb(null);
        }, 1400);
      }
    }
  };

  const untap = (lo) => {
    if (fb) return; playSound("click");
    setBuilt((b) => b.filter((x) => x.id !== lo.id));
    setAvail((a) => [...a, lo]);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83d\udd24"} score={score} total={R} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={R} score={score} color="#A855F7" />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p style={S.prompt}>Bouw het woord! Tik de letters in de juiste volgorde.</p>
        <div style={S.bigEmoji}>{cur.emoji}</div>
        <p style={{ textAlign: "center", color: "#aaa", fontSize: 14, fontStyle: "italic" }}>{cur.hint}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "20px 0 16px" }}>
          {cur.woord.split("").map((_, i) => (
            <div key={i} onClick={() => built[i] && untap(built[i])} style={{
              width: 48, height: 56, borderRadius: 12,
              border: built[i] ? (fb && !fb.ok ? "3px solid #e74c3c" : fb && fb.ok ? "3px solid #4ECDC4" : "3px solid #A855F7")
                : "3px dashed #ddd",
              background: built[i] ? (fb && !fb.ok ? "#fdeaea" : fb && fb.ok ? "#d4edda" : "#f3e8ff") : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, fontFamily: "'Fredoka One', cursive",
              color: "#2d3436", transition: "all 0.2s", cursor: "pointer", textTransform: "lowercase",
              animation: fb && !fb.ok && built[i] ? "shake 0.4s" : "none",
            }}>{built[i]?.l || ""}</div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {avail.map((lo) => (
            <button key={lo.id} onClick={() => tapLetter(lo)} style={{
              width: 48, height: 56, borderRadius: 12, border: "none",
              background: "linear-gradient(180deg, #A855F7 0%, #7c3aed 100%)",
              color: "white", fontSize: 26, fontWeight: 700,
              fontFamily: "'Fredoka One', cursive", cursor: "pointer",
              boxShadow: "0 4px 0 #5b21b6", transition: "all 0.15s", textTransform: "lowercase",
            }}>{lo.l}</button>
          ))}
        </div>
        {fb && <div style={{ ...S.fbBub, backgroundColor: fb.ok ? "#d4edda" : "#fff3cd", color: fb.ok ? "#155724" : "#856404" }}>{fb.t}</div>}
      </div>
    </div>
  );
};

/* ===== HOME ===== */
const HomeScreen = ({ onSelect, totalStars }) => {
  const games = [
    { id: "woorden", title: "Woordenwiel", sub: "Lees het woord bij het plaatje", emoji: "\ud83d\udcd6", bg: "linear-gradient(135deg, #45B7D1, #2980b9)" },
    { id: "rekenen", title: "Rekenrace", sub: "Tel en reken met voertuigen", emoji: "\ud83d\udd22", bg: "linear-gradient(135deg, #FF9F43, #e67e22)" },
    { id: "letters", title: "Letterbouwer", sub: "Spel het woord letter voor letter", emoji: "\ud83d\udd24", bg: "linear-gradient(135deg, #A855F7, #7c3aed)" },
  ];
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 40px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
        <div style={{ fontSize: 80, animation: "bounce 2s infinite", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}>{"\ud83d\udeb2"}</div>
        <h1 style={{
          fontFamily: "'Fredoka One', cursive", fontSize: 42, margin: "8px 0 4px",
          background: "linear-gradient(135deg, #e67e22, #e74c3c)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>Fietsenmaker</h1>
        <p style={{ fontSize: 18, color: "#888", margin: 0, fontWeight: 600 }}>Leer, bouw en reken!</p>
        {totalStars > 0 && (
          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: "#e67e22", background: "rgba(255,255,255,0.7)", display: "inline-block", padding: "6px 16px", borderRadius: 20 }}>
            {"\u2b50"} {totalStars} sterren verzameld
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {games.map((g, i) => (
          <button key={g.id} onClick={() => { playSound("click"); onSelect(g.id); }} style={{
            display: "flex", alignItems: "center", gap: 16, background: "white",
            border: "none", borderRadius: 20, padding: 16, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transition: "transform 0.2s",
            textAlign: "left", fontFamily: "'Quicksand', sans-serif",
            animation: `slideUp 0.5s ${i * 0.1}s both`,
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: g.bg }}>
              <span style={{ fontSize: 44 }}>{g.emoji}</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#2d3436" }}>{g.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: "#888", fontWeight: 500 }}>{g.sub}</p>
            </div>
            <div style={{ fontSize: 24, color: "#ccc", fontWeight: 700 }}>{"\u2192"}</div>
          </button>
        ))}
      </div>
      <div style={{ position: "relative", height: 60, marginTop: "auto", paddingTop: 20, overflow: "hidden" }}>
        <span style={{ fontSize: 28, position: "absolute", bottom: 16, animation: "drive 4s linear infinite" }}>{"\ud83d\udeb2"}</span>
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, height: 6, background: "#ddd", borderRadius: 3 }} />
      </div>
    </div>
  );
};

/* ===== APP ===== */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [totalStars, setTotalStars] = useState(0);
  const addScore = (s) => setTotalStars((t) => t + s);

  return (
    <div style={S.app}>
      <style>{KF}</style>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Fredoka+One&display=swap" rel="stylesheet" />
      {screen === "home" && <HomeScreen onSelect={setScreen} totalStars={totalStars} />}
      {screen === "woorden" && <Woordenwiel onBack={() => setScreen("home")} onScore={addScore} />}
      {screen === "rekenen" && <Rekenrace onBack={() => setScreen("home")} onScore={addScore} />}
      {screen === "letters" && <Letterbouwer onBack={() => setScreen("home")} onScore={addScore} />}
    </div>
  );
}

const S = {
  app: { fontFamily: "'Quicksand', sans-serif", minHeight: "100vh", background: "linear-gradient(180deg, #FFF8E7 0%, #FFF1D0 50%, #FDEBD0 100%)", color: "#2d3436", overflowX: "hidden" },
  gc: { maxWidth: 480, margin: "0 auto", padding: "12px 16px 40px", minHeight: "100vh" },
  topBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "8px 0" },
  backBtn: { background: "rgba(255,255,255,0.8)", border: "none", borderRadius: 12, padding: "8px 14px", fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", color: "#555", whiteSpace: "nowrap" },
  scoreTag: { background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: "8px 14px", fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" },
  card: { background: "white", borderRadius: 24, padding: "24px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" },
  gt: { fontFamily: "'Fredoka One', cursive", fontSize: 28, margin: "8px 0", color: "#2d3436" },
  prompt: { textAlign: "center", color: "#888", fontSize: 16, margin: "0 0 8px" },
  bigEmoji: { textAlign: "center", fontSize: 80, margin: "8px 0 12px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" },
  emojiGrid: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, margin: "8px 0 20px", minHeight: 50, alignItems: "center" },
  hintBtn: { display: "block", margin: "0 auto 12px", background: "none", border: "2px dashed #ddd", borderRadius: 12, padding: "6px 16px", fontSize: 14, cursor: "pointer", color: "#aaa", fontFamily: "'Quicksand', sans-serif", fontWeight: 600 },
  hintTxt: { textAlign: "center", color: "#aaa", fontSize: 14, fontStyle: "italic", margin: "0 0 12px" },
  opts: { display: "flex", flexDirection: "column", gap: 10, marginTop: 16 },
  optBtn: { padding: "16px 20px", fontSize: 24, fontWeight: 700, fontFamily: "'Quicksand', sans-serif", border: "3px solid #e8e8e8", borderRadius: 16, background: "#fafafa", cursor: "pointer", transition: "all 0.2s", letterSpacing: 2, color: "#2d3436" },
  optOk: { borderColor: "#4ECDC4", background: "#d4edda", transform: "scale(1.03)" },
  fbBub: { marginTop: 16, padding: "12px 18px", borderRadius: 14, textAlign: "center", fontSize: 18, fontWeight: 700, animation: "popIn 0.3s ease" },
  btn: { padding: "14px 28px", fontSize: 18, fontWeight: 700, fontFamily: "'Quicksand', sans-serif", border: "none", borderRadius: 14, cursor: "pointer", transition: "all 0.2s" },
  btnP: { background: "linear-gradient(135deg, #FF9F43, #e67e22)", color: "white", boxShadow: "0 4px 0 #d35400" },
};

const KF = `
@keyframes popIn { 0%{transform:scale(.8);opacity:0} 50%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
@keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
@keyframes drive { 0%{transform:translateX(-40px)} 100%{transform:translateX(calc(100vw + 40px))} }
`;
