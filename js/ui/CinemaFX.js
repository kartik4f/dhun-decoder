/**
 * CinemaFX — the "lights, camera, action" layer for a scene:
 * film grain, a dark vignette, letterbox bars and camera moves
 * (flash, zoom punch, shake, the classic triple dramatic zoom, heartbeat pulses).
 * Camera moves and flicker are skipped when the player prefers reduced motion.
 */
class CinemaFX {
  constructor(scene, { grain = 0.06, vignette = 0.6 } = {}) {
    this.scene = scene;
    this.cam = scene.cameras.main;
    this.off = Theme.reducedMotion;
    const { W, H } = Layout.current;
    this.W = W;
    this.H = H;

    // Overlays are larger than the screen so zoom punches never show their edges.
    this.vignette = scene.add.image(W / 2, H / 2, 'fx-vignette').setDisplaySize(W * 1.4, H * 1.4).setDepth(44).setAlpha(vignette);
    this.red = scene.add.image(W / 2, H / 2, 'fx-vignette-red').setDisplaySize(W * 1.4, H * 1.4).setDepth(44).setAlpha(0);
    this.grain = scene.add.tileSprite(W / 2, H / 2, W * 1.4, H * 1.4, 'fx-grain').setDepth(45).setAlpha(grain);

    const barH = 400;
    this.barH = barH;
    this.topBar = scene.add.rectangle(W / 2, -barH / 2, W * 1.6, barH, 0x000000).setDepth(46);
    this.bottomBar = scene.add.rectangle(W / 2, H + barH / 2, W * 1.6, barH, 0x000000).setDepth(46);

    if (!this.off) {
      const flicker = () => {
        this.grain.setTilePosition(Math.random() * 256, Math.random() * 256);
      };
      scene.events.on('update', flicker);
      scene.events.once('shutdown', () => scene.events.off('update', flicker));
    }
  }

  /** Slide the black letterbox bars in (h px each) or out. */
  letterbox(on, h = 64, duration = 280) {
    const { H, barH } = this;
    this.scene.tweens.add({ targets: this.topBar, y: on ? -barH / 2 + h : -barH / 2, duration, ease: 'Cubic.easeOut' });
    this.scene.tweens.add({ targets: this.bottomBar, y: on ? H + barH / 2 - h : H + barH / 2, duration, ease: 'Cubic.easeOut' });
  }

  /** A see-through flash of light that fades out (softer than a full-screen camera flash). */
  flash(rgb = [255, 241, 214], duration = 220, peak = 0.55) {
    if (this.off) return;
    const color = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
    const f = this.scene.add.rectangle(this.W / 2, this.H / 2, this.W * 1.6, this.H * 1.6, color).setDepth(43).setAlpha(peak);
    this.scene.tweens.add({ targets: f, alpha: 0, duration: duration + 120, ease: 'Quad.easeOut', onComplete: () => f.destroy() });
  }

  /** Quick push-in and back, like a punch on the beat. */
  punch(zoom = 1.06, duration = 90) {
    if (this.off) return;
    this.cam.zoomTo(zoom, duration, 'Quad.easeOut', true, (cam, progress) => {
      if (progress === 1) cam.zoomTo(1, 240, 'Quad.easeInOut', true);
    });
  }

  shake(duration = 140, intensity = 0.005) {
    if (this.off) return;
    this.cam.shake(duration, intensity);
  }

  /** Dhan … dhan … dhaaan: three hard zooms onto a point, synced with Sfx.dramatic(). */
  tripleZoom(x, y, hold = 1500) {
    if (this.off) return;
    this.cam.pan(x, y, 200, 'Quad.easeOut', true);
    [[0, 1.08], [360, 1.16], [780, 1.26]].forEach(([at, z]) => {
      this.scene.time.delayedCall(at, () => {
        this.cam.zoomTo(z, 70, 'Quad.easeOut', true);
        this.shake(90, 0.004);
      });
    });
    this.scene.time.delayedCall(hold, () => this.reset(450));
  }

  reset(duration = 300) {
    this.cam.pan(this.W / 2, this.H / 2, duration, 'Quad.easeInOut', true);
    this.cam.zoomTo(1, duration, 'Quad.easeInOut', true);
  }

  /** Red edges pulse once (time pressure). */
  redPulse(peak = 0.55) {
    this.scene.tweens.killTweensOf(this.red);
    this.red.setAlpha(peak);
    this.scene.tweens.add({ targets: this.red, alpha: 0, duration: 520, ease: 'Quad.easeOut' });
  }

  heartbeat() {
    this.punch(1.018, 70);
    this.redPulse(0.45);
  }
}
