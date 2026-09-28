// One shared AudioContext. Creating one per sound leaks: browsers cap the
// number of live contexts (iOS at a handful), after which sound stops and
// Chrome eventually kills the page.
let sharedCtx = null;
function getCtx() {
  if (!sharedCtx) sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (sharedCtx.state === "suspended") sharedCtx.resume();
  return sharedCtx;
}

export const playSound = (type) => {
  try {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.value = 0.15;

    if (type === "correct") {
      o.frequency.value = 523;
      o.type = "sine";
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      o.start();
      o.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2);
        g2.connect(ctx.destination);
        o2.frequency.value = 659;
        o2.type = "sine";
        g2.gain.value = 0.15;
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        o2.start();
        o2.stop(ctx.currentTime + 0.4);
      }, 150);
    } else if (type === "wrong") {
      o.frequency.value = 200;
      o.type = "triangle";
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } else if (type === "click") {
      o.frequency.value = 880;
      o.type = "sine";
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      o.start();
      o.stop(ctx.currentTime + 0.08);
    } else if (type === "win") {
      [523, 659, 784, 1047].forEach((f, i) => {
        const ow = ctx.createOscillator();
        const gw = ctx.createGain();
        ow.connect(gw);
        gw.connect(ctx.destination);
        ow.frequency.value = f;
        ow.type = "sine";
        gw.gain.value = 0.12;
        gw.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3 + i * 0.15);
        ow.start(ctx.currentTime + i * 0.15);
        ow.stop(ctx.currentTime + 0.3 + i * 0.15);
      });
    } else if (type === "beep") {
      // Countdown beep; "go" variant is higher and longer
      o.frequency.value = 660;
      o.type = "square";
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      o.start();
      o.stop(ctx.currentTime + 0.18);
    } else if (type === "rumble") {
      // Rocket engine: filtered noise that swells, then fades over ~4s
      const len = ctx.sampleRate * 4.5;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(180, ctx.currentTime);
      lp.frequency.linearRampToValueAtTime(900, ctx.currentTime + 1.2);
      lp.frequency.linearRampToValueAtTime(300, ctx.currentTime + 4.5);
      const gr = ctx.createGain();
      gr.gain.setValueAtTime(0.001, ctx.currentTime);
      gr.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.8);
      gr.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);
      src.connect(lp);
      lp.connect(gr);
      gr.connect(ctx.destination);
      src.start();
      src.stop(ctx.currentTime + 4.5);
    } else if (type === "medal") {
      // Triumphant fanfare: ascending run then held chord
      const fanfare = [523, 659, 784, 1047, 784, 1047, 1319];
      fanfare.forEach((f, i) => {
        const om = ctx.createOscillator();
        const gm = ctx.createGain();
        om.connect(gm);
        gm.connect(ctx.destination);
        om.frequency.value = f;
        om.type = i >= 5 ? "sine" : "triangle";
        const start = ctx.currentTime + i * 0.1;
        const dur = i >= 5 ? 0.5 : 0.15;
        gm.gain.setValueAtTime(0.13, start);
        gm.gain.exponentialRampToValueAtTime(0.01, start + dur);
        om.start(start);
        om.stop(start + dur);
      });
    }
  } catch (e) {}
};
