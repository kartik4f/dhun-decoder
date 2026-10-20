/**
 * PuzzleScene — "Action!": decode one song from its emoji clue before the clock runs out.
 *
 * Each round opens with a clapperboard and letterbox bars; the clock starts on the clap.
 * Correct letters spark, wrong ones shake the camera, the last ten seconds pulse like a
 * heartbeat. A solve gets a flash, paparazzi and a hype word; a miss gets the triple
 * dramatic zoom.
 *
 * Portrait: clue, title and keys stacked. Landscape: clue and hints on the left,
 * title and keys on the right. On rotation the scene rebuilds from snapshot().
 */
class PuzzleScene extends BaseScene {
  constructor() {
    super('Puzzle');
  }

  init(data) {
    this.run = RunState.current;
    this.restore = data && data.restore ? data.restore : null;
    this.phase = 'intro';
    this.letterHints = 0;
    this.filmShown = false;
    this.lastBeep = null;
    this.outcome = null;
  }

  create() {
    this.prepare();
    const L = this.L;
    const P = L.portrait;
    const C = Theme.color;
    if (!this.run || !this.run.segment) {
      this.scene.start('Menu', {});
      return;
    }

    const seg = this.run.segment;
    this.mod = MODIFIERS[seg.mod];
    const R = this.restore;
    this.song = R ? R.song : this.run.pickSong();
    this.total = R ? R.total : this.run.timeFor(this.song, this.mod);
    this.left = R ? R.left : this.total;
    this.eraKey = seg.era === 'any' ? this.song.era : seg.era;

    this.stage = new Stage(this, { spots: 2, spotAlpha: 0.07, hud: true });
    this.stage.spots.setColor(C[ERAS[this.eraKey].fill]);
    this.stage.rig.setColor(C[ERAS[this.eraKey].fill]);
    this.fx = new CinemaFX(this, { vignette: 0.5 });
    this.effects = new Effects(this);
    this.hud = new HudBar(this, this.run).setOnPause(() => this.openPause());
    this.enableRunControls();
    this.saveClock = 0;
    new Badge(this, L.cx, P ? 118 : 106, {
      icon: this.mod.icon,
      text: this.mod.mult !== 1 ? `×${this.mod.mult}` : this.mod.name,
      fill: C.deep,
      color: seg.mod === 'boss' ? Theme.css.rose : Theme.css.marigold,
      edge: seg.mod === 'boss' ? C.rose : C.panelEdge,
      size: 18,
      height: 36
    });

    this.timer = new TimerBar(this, 40, P ? 168 : 152, L.W - 80);
    this.timer.set(this.left, this.total);

    this.lx = P ? L.cx : 330;
    this.clueY = P ? 335 : 352;
    this.clue = new ClueCard(this, this.lx, this.clueY, P ? 640 : 560, P ? 250 : 240, this.song, this.eraKey, false);
    this.board = new LetterBoard(this, P ? L.cx : 960, P ? 592 : 292, P ? 650 : 560, this.song.s, P ? 196 : 210);

    // Hints
    const locked = !!this.mod.noHints;
    const hy = P ? 748 : 548;
    const hw = P ? 312 : 272;
    this.filmBtn = new TextButton(this, P ? 196 : 191, hy, hw, 66, locked ? '' : '−25%', {
      fill: C.panelEdge, textColor: Theme.css.cream, size: 24, icon: locked ? 'ic-lock-cream' : 'ic-film-cream', iconSize: 30
    }).setOnClick(() => this.useFilmHint());
    this.letterBtn = new TextButton(this, P ? 524 : 469, hy, hw, 66, locked ? '' : '−40', {
      fill: C.panelEdge, textColor: Theme.css.cream, size: 24, icon: locked ? 'ic-lock-cream' : 'ic-lightbulb-cream', iconSize: 30
    }).setOnClick(() => this.useLetterHint());
    if (locked) {
      this.filmBtn.setEnabled(false);
      this.letterBtn.setEnabled(false);
    }

    this.keys = P
      ? new KeyPad(this, L.cx, 846, (k) => this.guess(k), { kw: 60, kh: 82 })
      : new KeyPad(this, 960, 472, (k) => this.guess(k), { kw: 52, kh: 72 });
    this.status = this.add.text(this.lx, P ? 1160 : 640, '', Theme.text(26, { fontStyle: '800', align: 'center' })).setOrigin(0.5);

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (e) => {
        if (this.phase === 'done' && (e.key === 'Enter' || e.key === ' ')) {
          this.next();
          return;
        }
        const k = (e.key || '').toUpperCase();
        if (/^[A-Z]$/.test(k)) this.guess(k);
      });
    }

    this.overlay = this.add.container(0, 0).setVisible(false).setDepth(10);
    FilmiScore.shared.start('groove');

    if (R) {
      this.applyRestore(R);
    } else {
      if (this.mod.vowels) {
        ['A', 'E', 'I', 'O', 'U'].forEach((v) => {
          const n = this.board.reveal(v, 'hint', false).length;
          this.keys.mark(v, n > 0 ? 'hit' : 'miss', false);
        });
      }
      this.playIntro();
    }
  }

  /** Clapperboard + letterbox, then the clue pops in and the clock starts on "Action!". */
  playIntro() {
    const L = this.L;
    const seg = this.run.segment;
    const era = ERAS[this.eraKey];
    this.setStatus('');
    this.clue.setAlpha(0);
    this.fx.letterbox(true, this.L.portrait ? 90 : 60);

    const board = new Clapperboard(this, L.cx, L.cy, {
      sceneNo: String(this.run.round),
      take: this.run.isDaily ? `${this.run.round}/${RunState.DAILY_ROUNDS}` : String(this.run.lives),
      title: seg.mod === 'boss' ? 'Showstopper' : era.name,
      sub: `${era.years.toUpperCase()}  ·  ${this.mod.name.toUpperCase()}`
    });
    board.play({
      onClap: () => {
        this.fx.shake(120, 0.006);
        this.fx.flash([255, 241, 214], 140);
        HypeText.pop(this, L.cx, L.cy - 190, 'Action!', { size: 104, color: Theme.css.rose, hold: 520 });
      },
      onDone: () => this.startAction()
    });
  }

  startAction() {
    if (this.phase !== 'intro') return;
    this.phase = 'play';
    this.fx.letterbox(false);
    this.clue.destroy();
    this.clue = new ClueCard(this, this.lx, this.clueY, this.L.portrait ? 640 : 560, this.L.portrait ? 250 : 240, this.song, this.eraKey, true);
    this.stage.spots.burst(0.3, 700);
    this.setStatus('');
    this.persist();
  }

  snapshot() {
    return {
      restore: {
        song: this.song,
        total: this.total,
        left: this.left,
        keys: this.keys.states(),
        looks: this.board.revealedLooks(),
        filmShown: this.filmShown,
        letterHints: this.letterHints,
        phase: this.phase === 'intro' ? 'play' : this.phase,
        outcome: this.outcome
      }
    };
  }

  applyRestore(R) {
    this.phase = 'play';
    Object.entries(R.keys).forEach(([k, state]) => this.keys.mark(k, state, false));
    Object.entries(R.looks).forEach(([k, look]) => this.board.reveal(k, look, false));
    this.letterHints = R.letterHints;
    if (this.letterHints >= PuzzleScene.MAX_LETTER_HINTS) this.letterBtn.setEnabled(false).setLabel('');
    if (R.filmShown) {
      this.filmShown = true;
      this.clue.showFilm(false);
      this.filmBtn.setEnabled(false).setLabel('');
    }
    if (R.phase === 'done' && R.outcome) {
      this.phase = 'done';
      this.outcome = R.outcome;
      this.keys.setEnabled(false);
      if (R.outcome.solved) this.board.celebrate(false);
      else this.board.revealAllMissed();
      this.showResult(R.outcome.solved, R.outcome.res, false);
    } else {
      this.setStatus('');
    }
  }

  setStatus(text, color = Theme.css.cream) {
    this.status.setText(text).setColor(color);
  }

  guess(k) {
    if (this.phase !== 'play' || this.keys.isUsed(k)) return;
    const opened = this.board.reveal(k);
    if (opened.length > 0) {
      this.keys.mark(k, 'hit');
      Sfx.shared.hit();
      opened.forEach((p) => this.effects.sparkAt(p.x, p.y, 7));
      if (opened.length >= 2) this.fx.punch(1.025, 70);
      this.setStatus(opened.length > 1 ? `${k} ×${opened.length}` : `${k} ✓`, Theme.css.mint);
    } else {
      this.keys.mark(k, 'miss');
      Sfx.shared.miss();
      Settings.buzz(35);
      this.left = Math.max(0, this.left - PuzzleScene.MISS_PENALTY);
      this.timer.jolt();
      this.fx.shake(140, 0.006);
      this.fx.redPulse(0.35);
      this.setStatus(`${k} ✗  −${PuzzleScene.MISS_PENALTY}s`, Theme.css.rose);
    }
    if (this.board.isComplete) this.solve();
  }

  useFilmHint() {
    if (this.phase !== 'play' || this.filmShown || this.mod.noHints) return;
    this.filmShown = true;
    this.clue.showFilm();
    this.filmBtn.setEnabled(false).setLabel('');
    this.setStatus('×0.75', Theme.css.marigold);
  }

  useLetterHint() {
    if (this.phase !== 'play' || this.mod.noHints) return;
    const hidden = this.board.hiddenLetters();
    if (hidden.length <= 1) {
      this.setStatus('1 left!', Theme.css.marigold);
      return;
    }
    const k = hidden[0];
    this.letterHints += 1;
    this.board.reveal(k, 'hint');
    this.keys.mark(k, 'hit');
    Sfx.shared.hit();
    this.setStatus(`${k}  −40`, Theme.css.marigold);
    if (this.letterHints >= PuzzleScene.MAX_LETTER_HINTS) this.letterBtn.setEnabled(false).setLabel('');
    if (this.board.isComplete) this.solve();
  }

  update(time, delta) {
    if (this.phase !== 'play') return;
    this.left -= delta / 1000;
    this.timer.set(this.left, this.total);

    // The groove speeds up and fills out as the clock runs down.
    const used = 1 - Math.max(0, this.left) / this.total;
    FilmiScore.shared.setUrgency(this.left <= 10 ? Math.max(used, 0.95) : used);

    const sec = Math.ceil(this.left);
    if (sec <= 10 && sec > 0 && sec !== this.lastBeep) {
      this.lastBeep = sec;
      Sfx.shared.beep();
      this.fx.heartbeat();
    }
    // Keep the saved game fresh, so closing the tab loses at most a moment.
    this.saveClock += delta;
    if (this.saveClock > 2000) {
      this.saveClock = 0;
      this.persist();
    }
    if (this.left <= 0) this.fail();
  }

  calmMusic() {
    FilmiScore.shared.calm();
  }

  solve() {
    this.phase = 'done';
    this.keys.setEnabled(false);
    const res = this.run.recordSolve({
      left: this.left,
      total: this.total,
      mod: this.mod,
      letterHints: this.letterHints,
      filmShown: this.filmShown,
      song: this.song
    });
    this.outcome = { solved: true, res };
    this.persist();
    this.calmMusic();
    Sfx.shared.shehnai();
    Settings.buzz([20, 40, 20]);
    this.board.celebrate();

    // Lights, flashes, hype.
    this.fx.flash([255, 241, 214], 220);
    this.fx.punch(1.08, 100);
    this.stage.spots.burst(0.6, 1200);
    this.effects.confettiAt(this.board.x, this.board.y, res.fast ? 120 : 80);
    this.effects.paparazzi(res.clean ? 10 : 5, 1);
    const word = HypeText.wordFor(this.run.combo, res.fast, res.clean);
    HypeText.pop(this, this.lx, this.clueY, word, { size: 100, color: res.clean ? Theme.css.marigold : Theme.css.teal, hold: 700 });

    this.hud.popScore();
    this.showResult(true, res, true);
  }

  fail() {
    this.phase = 'done';
    this.left = 0;
    this.timer.set(0, this.total);
    this.keys.setEnabled(false);
    this.run.recordMiss(this.song);
    this.outcome = { solved: false };
    this.persist();
    this.calmMusic();
    Settings.buzz([60, 40, 140]);

    // Dhan … dhan … dhaaan: letterbox, red flash, three zooms onto the answer.
    Sfx.shared.dramatic();
    this.board.revealAllMissed();
    this.hud.loseHeart();
    this.fx.letterbox(true, this.L.portrait ? 100 : 60, 220);
    this.fx.flash([229, 72, 77], 180);
    this.fx.redPulse(0.8);
    this.fx.tripleZoom(this.board.x, this.board.y, 1500);
    this.time.delayedCall(820, () => {
      HypeText.pop(this, this.board.x, this.board.y - 120, this.run.lives > 0 ? 'Flop!' : 'The End', { size: 110, color: Theme.css.rose, angle: -8, hold: 600 });
    });
    this.time.delayedCall(1900, () => {
      this.fx.letterbox(false);
      this.showResult(false, null, true);
    });
  }

  showResult(solved, res, animate) {
    const C = Theme.color;
    const L = this.L;
    const P = L.portrait;
    const cx = P ? L.cx : 960;
    const top = P ? 712 : 150;
    const w = P ? 680 : 580;
    const h = 540;

    const g = this.add.graphics();
    if (P) g.fillStyle(C.bg, 0.96).fillRect(0, top - 12, L.W, L.H - top + 12);
    else g.fillStyle(C.bg, 0.96).fillRect(cx - w / 2 - 20, top - 12, w + 40, L.H - top + 12);
    g.fillStyle(C.panel, 1).fillRoundedRect(cx - w / 2, top, w, h, 26);
    g.lineStyle(3, solved ? C.mint : C.rose, 1).strokeRoundedRect(cx - w / 2, top, w, h, 26);
    this.overlay.add(g);

    const head = solved ? (res.fast ? 'Lightning crack!' : 'Cracked it!') : "Reel's run out";
    this.overlay.add(this.add.text(cx, top + 50, head, Theme.text(50, { fontFamily: Theme.font.display, color: solved ? Theme.css.mint : Theme.css.rose })).setOrigin(0.5));
    const title = this.add.text(cx, top + 112, `“${this.song.s}”`, Theme.text(28, { fontStyle: '800', align: 'center', wordWrap: { width: w - 60 } })).setOrigin(0.5);
    const film = this.add.text(cx, top + 150, `from ${this.song.f}`, Theme.text(20, { fontStyle: '600', color: Theme.css.muted })).setOrigin(0.5);
    Theme.clip(film, w - 60);
    this.overlay.add([title, film]);

    if (solved) {
      const chips = [{ icon: 'timer', text: `+${res.speed}` }];
      if (res.letterHints) chips.push({ icon: 'lightbulb', text: `−${res.letterHints * 40}` });
      if (res.filmShown) chips.push({ icon: 'film', text: '×0.75' });
      if (res.mult !== 1) chips.push({ icon: this.mod.icon, text: `×${res.mult}` });
      if (res.comboMult > 1) chips.push({ icon: 'flame', text: `×${res.comboMult}` });
      Badge.row(this, cx, top + 222, chips.map((c) => Object.assign({ fill: C.deep, edge: C.panelEdge, size: 20, height: 42 }, c)), 10).forEach((chip, i) => {
        this.overlay.add(chip);
        if (animate) chip.pop(250 + i * 110);
      });
      const pts = this.add.text(cx, top + 330, `+${animate ? 0 : res.points}`, Theme.text(76, { fontFamily: Theme.font.display, color: Theme.css.marigold })).setOrigin(0.5);
      this.overlay.add(pts);
      if (animate) {
        this.tweens.addCounter({
          from: 0,
          to: res.points,
          duration: 700,
          delay: 250 + chips.length * 110,
          ease: 'Cubic.easeOut',
          onUpdate: (tw) => pts.setText(`+${Math.round(tw.getValue())}`),
          onComplete: () => {
            if (!Theme.reducedMotion) this.tweens.add({ targets: pts, scale: { from: 1.3, to: 1 }, duration: 260, ease: 'Back.easeOut' });
          }
        });
      }
    } else {
      const left = this.run.lives;
      const hearts = this.add.graphics();
      for (let i = 0; i < RunState.LIVES; i++) this.hud.drawHeart(hearts, cx + (i - 1) * 64, top + 250, i < left);
      hearts.setScale(1);
      this.overlay.add(hearts);
      const broke = this.add.text(cx, top + 318, left > 0 ? `${left} left` : '0', Theme.text(28, { fontStyle: '800', color: Theme.css.rose })).setOrigin(0.5);
      this.overlay.add(broke);
    }

    const last = this.run.over;
    this.nextBtn = new TextButton(this, cx, top + h - 50, w - 120, 84, last ? 'Finale' : 'Next', { size: 32, icon: last ? 'ic-sparkles-ink' : 'ic-play-ink', iconSize: 34 });
    this.nextBtn.setOnClick(() => this.next());
    this.overlay.add(this.nextBtn);
    if (animate) {
      this.nextBtn.setEnabled(false);
      this.time.delayedCall(650, () => this.nextBtn.setEnabled(true));
    }

    this.overlay.setVisible(true);
    if (animate && !Theme.reducedMotion) {
      this.tweens.add({ targets: this.overlay, y: { from: 80, to: 0 }, alpha: { from: 0, to: 1 }, duration: 320, ease: 'Cubic.easeOut' });
    }
    // Real link to the official song, opened in a new tab.
    this.listen = ListenLink.create(this, cx, top + 428, this.song);
  }

  next() {
    if (this.phase !== 'done' || !this.nextBtn || !this.nextBtn.enabled) return;
    this.nextBtn.setEnabled(false);
    this.scene.start(this.run.over ? 'Wrap' : 'Spin', {});
  }
}

PuzzleScene.MISS_PENALTY = 4;
PuzzleScene.MAX_LETTER_HINTS = 2;
