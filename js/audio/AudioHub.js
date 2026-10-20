/**
 * AudioHub — the one Web Audio context, with separate buses for sound effects and music.
 * The context is created on the first sound, which always follows a tap or key press
 * (browsers block audio before that).
 */
class AudioHub {
  constructor() {
    this.ctx = null;
    this.sfxOn = true;
    this.musicOn = true;
    this.musicLevel = 0.5;
    this.sfxLevel = 0.9;
  }

  /** Music volume 0..1 (the slider); the bus runs at up to 0.7 so effects stay on top. */
  setMusicVolume(v) {
    this.musicLevel = Phaser.Math.Clamp(v, 0, 1) * 0.7;
    if (this.ctx) this.musicBus.gain.setTargetAtTime(this.musicLevel, this.ctx.currentTime, 0.05);
  }

  setSfxVolume(v) {
    this.sfxLevel = Phaser.Math.Clamp(v, 0, 1) * 1.1;
    if (this.ctx) this.sfxBus.gain.setTargetAtTime(this.sfxLevel, this.ctx.currentTime, 0.05);
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        this.ctx = new AC();
      } catch (e) {
        return null;
      }
      const ctx = this.ctx;
      this.master = ctx.createDynamicsCompressor();
      this.master.threshold.value = -14;
      this.master.ratio.value = 4;
      this.master.connect(ctx.destination);

      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = this.sfxLevel;
      this.sfxBus.connect(this.master);

      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = this.musicLevel;
      this.musicBus.connect(this.master);

      // One second of white noise, reused for drum slaps and shakers.
      const len = ctx.sampleRate;
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  get running() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  noiseSource() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    return src;
  }

  /** Dip the music so a sting can be heard, then bring it back. */
  duck(seconds = 1.5, floor = 0.12) {
    if (!this.ctx) return;
    const g = this.musicBus.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(this.musicLevel * floor, t + 0.08);
    g.setValueAtTime(this.musicLevel * floor, t + seconds);
    g.linearRampToValueAtTime(this.musicLevel, t + seconds + 0.6);
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
}

AudioHub.shared = new AudioHub();
