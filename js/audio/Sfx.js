/**
 * Sfx — short sound effects and filmi stings, all synthesised.
 *
 *   tick       tiny UI tick
 *   clack      wooden peg snapping past the wheel's flapper (harder as the wheel slows)
 *   drumroll   tabla roll that speeds up and lands on a dhol hit
 *   hit / miss correct and wrong letters
 *   beep       last ten seconds
 *   shehnai    reedy flourish for a cracked song
 *   dramatic   "dhan dhan dhaaan" stabs when the reel runs out
 *   curtain    end-of-show fanfare
 *   clap       clapperboard snap on "Action!"
 *   shutter    press-camera click for paparazzi flashes
 *   whoosh     something flying in
 */
class Sfx {
  constructor(hub) {
    this.hub = hub;
  }

  ctx() {
    if (!this.hub.sfxOn) return null;
    return this.hub.ensure();
  }

  tone(freq, dur, { type = 'sine', gain = 0.15, slideTo = 0, delay = 0 } = {}) {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.hub.sfxBus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  tick() {
    this.tone(2100, 0.03, { type: 'square', gain: 0.035 });
  }

  /**
   * A wooden peg snapping past the flapper. v (0..1) is how hard: fast pegs are bright and
   * light, the last slow ones are fuller and louder, like a real prize wheel.
   */
  clack(v = 0.5) {
    const ctx = this.ctx();
    if (!ctx) return;
    const hub = this.hub;
    const t = ctx.currentTime + 0.002;
    const slow = 1 - Phaser.Math.Clamp(v, 0, 1);
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 1700 + 1200 * (1 - slow), q: 2.2, peak: 0.16 + 0.22 * slow, decay: 0.035 });
    Percussion.osc(hub, hub.sfxBus, t, { type: 'triangle', from: 1100 - 300 * slow, to: 520, peak: 0.08 + 0.14 * slow, decay: 0.05 });
  }

  hit() {
    this.tone(880, 0.12, { type: 'triangle', gain: 0.13 });
    this.tone(1320, 0.16, { type: 'triangle', gain: 0.1, delay: 0.05 });
  }

  miss() {
    this.tone(260, 0.22, { type: 'sawtooth', gain: 0.07, slideTo: 150 });
  }

  beep() {
    this.tone(1250, 0.07, { type: 'square', gain: 0.05 });
  }

  drumroll(seconds) {
    const ctx = this.ctx();
    if (!ctx) return;
    const hub = this.hub;
    const bus = hub.sfxBus;
    hub.duck(seconds, 0.25);
    let t = ctx.currentTime + 0.02;
    const end = t + seconds;
    let gap = 0.14;
    let v = 0.25;
    while (t < end - 0.04) {
      Percussion.na(hub, bus, t, v);
      t += gap;
      gap = Math.max(0.034, gap * 0.94);
      v = Math.min(0.9, v + 0.025);
    }
    Percussion.dha(hub, bus, end, 1);
    Percussion.ting(hub, bus, end, 1.4);
    Percussion.dha(hub, bus, end + 0.16, 0.7);
  }

  land() {
    const ctx = this.ctx();
    if (!ctx) return;
    Percussion.dha(this.hub, this.hub.sfxBus, ctx.currentTime + 0.01, 1);
    Percussion.ting(this.hub, this.hub.sfxBus, ctx.currentTime + 0.01, 1.4);
  }

  /** Reed voice with vibrato, played through a list of [frequency, seconds] notes. */
  reed(t, notes, { gain = 0.11, glideLast = 0 } = {}) {
    const ctx = this.hub.ctx;
    const o = ctx.createOscillator();
    const bp = ctx.createBiquadFilter();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    o.type = 'sawtooth';
    bp.type = 'bandpass';
    bp.frequency.value = 1500;
    bp.Q.value = 1.6;
    lp.type = 'lowpass';
    lp.frequency.value = 3600;
    vib.frequency.value = 5.8;
    vibGain.gain.value = 0;
    vib.connect(vibGain);
    vibGain.connect(o.frequency);
    o.connect(bp);
    bp.connect(lp);
    lp.connect(g);
    g.connect(this.hub.sfxBus);

    let at = t;
    g.gain.setValueAtTime(0.0001, at);
    notes.forEach(([f, d], k) => {
      o.frequency.setValueAtTime(f, at);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(gain, at + 0.025);
      if (k === notes.length - 1) {
        vibGain.gain.setValueAtTime(0, at);
        vibGain.gain.linearRampToValueAtTime(f * 0.012, at + 0.15);
        if (glideLast) o.frequency.exponentialRampToValueAtTime(glideLast, at + d * 0.5);
        g.gain.setValueAtTime(gain, at + d * 0.75);
        g.gain.exponentialRampToValueAtTime(0.0001, at + d);
      } else {
        g.gain.setValueAtTime(gain, at + d * 0.85);
        g.gain.linearRampToValueAtTime(gain * 0.4, at + d);
      }
      at += d;
    });
    o.start(t);
    vib.start(t);
    o.stop(at + 0.05);
    vib.stop(at + 0.05);
    return at;
  }

  shehnai() {
    const ctx = this.ctx();
    if (!ctx) return;
    this.hub.duck(1.6, 0.15);
    const t = ctx.currentTime + 0.02;
    const SA = 587.33;
    const r = (semi) => SA * Math.pow(2, semi / 12);
    this.reed(t, [[r(0), 0.08], [r(2), 0.08], [r(4), 0.08], [r(5), 0.08], [r(7), 0.1], [r(9), 0.1], [r(11), 0.62]], { glideLast: r(12) });
    Percussion.dha(this.hub, this.hub.sfxBus, t, 0.8);
    Percussion.ting(this.hub, this.hub.sfxBus, t + 0.62, 1.2);
    Percussion.dha(this.hub, this.hub.sfxBus, t + 0.62, 0.9);
  }

  /** Three heavy stabs: dhan … dhan … dhaaan. */
  dramatic() {
    const ctx = this.ctx();
    if (!ctx) return;
    this.hub.duck(2.6, 0.05);
    const t0 = ctx.currentTime + 0.02;
    const chords = [
      [196.0, 233.08, 293.66],
      [185.0, 220.0, 277.18],
      [146.83, 174.61, 220.0]
    ];
    const times = [0, 0.36, 0.78];
    chords.forEach((freqs, k) => {
      const t = t0 + times[k];
      const long = k === chords.length - 1;
      const dur = long ? 1.7 : 0.26;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2200, t);
      lp.frequency.exponentialRampToValueAtTime(500, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      lp.connect(g);
      g.connect(this.hub.sfxBus);
      if (long) {
        const trem = ctx.createOscillator();
        const tremGain = ctx.createGain();
        trem.frequency.value = 9;
        tremGain.gain.value = 0.05;
        trem.connect(tremGain);
        tremGain.connect(g.gain);
        trem.start(t + 0.2);
        trem.stop(t + dur);
      }
      freqs.forEach((f) => {
        [-6, 6].forEach((cents) => {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = f;
          o.detune.value = cents;
          o.connect(lp);
          o.start(t);
          o.stop(t + dur + 0.05);
        });
      });
      // Timpani under each stab
      Percussion.osc(this.hub, this.hub.sfxBus, t, { from: long ? 82 : 98, to: long ? 55 : 70, peak: 0.7, decay: long ? 1.1 : 0.4 });
      if (long) Percussion.noiseHit(this.hub, this.hub.sfxBus, t, { freq: 300, q: 0.5, peak: 0.12, decay: 1.2, type: 'lowpass' });
    });
  }

  clap() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const hub = this.hub;
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 2200, q: 0.7, peak: 0.7, decay: 0.05, type: 'highpass' });
    Percussion.osc(hub, hub.sfxBus, t, { type: 'triangle', from: 1100, to: 320, peak: 0.25, decay: 0.07 });
    Percussion.dha(hub, hub.sfxBus, t + 0.01, 1);
    Percussion.ting(hub, hub.sfxBus, t + 0.01, 1.2);
  }

  shutter() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const hub = this.hub;
    Percussion.noiseHit(hub, hub.sfxBus, t, { freq: 3800, q: 0.8, peak: 0.16, decay: 0.022, type: 'highpass' });
    Percussion.noiseHit(hub, hub.sfxBus, t + 0.055, { freq: 2600, q: 0.8, peak: 0.1, decay: 0.03, type: 'highpass' });
  }

  whoosh() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const src = this.hub.noiseSource();
    const bp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(350, t);
    bp.frequency.exponentialRampToValueAtTime(2600, t + 0.32);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.hub.sfxBus);
    src.start(t, Math.random() * 0.5, 0.42);
  }

  curtain() {
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.02;
    const hub = this.hub;
    [0, 0.18, 0.36, 0.5, 0.64].forEach((d, k) => Percussion.dha(hub, hub.sfxBus, t + d, k === 4 ? 1 : 0.7));
    const SA = 587.33;
    const r = (semi) => SA * Math.pow(2, semi / 12);
    this.reed(t + 0.7, [[r(7), 0.14], [r(9), 0.14], [r(7), 0.14], [r(5), 0.14], [r(4), 0.14], [r(2), 0.14], [r(0), 0.9]], { gain: 0.1 });
    Percussion.ting(hub, hub.sfxBus, t + 1.54, 1.4);
  }
}

Sfx.shared = new Sfx(AudioHub.shared);
