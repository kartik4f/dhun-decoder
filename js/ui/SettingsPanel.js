/**
 * SettingsPanel — the pause menu during a game, and the settings sheet on the menu.
 *
 *   mode 'pause'     run summary chips, sound and comfort options, then
 *                    Resume · Menu (the game is kept, resume it later) · New (endless only,
 *                    tap twice to confirm)
 *   mode 'settings'  just the options and Done
 *
 * Options: music on/off + volume, sounds on/off + volume, calm mode (fewer moving effects),
 * vibration (only shown where the device supports it). Every change applies at once and is
 * saved by Settings. While the panel is open, game input is paused and clicks never reach
 * the canvas underneath. Esc resumes / closes.
 */
class SettingsPanel {
  constructor({ game, mode = 'settings', run = null, onResume, onHome, onNew, onClose, onChange }) {
    this.game = game;
    this.mode = mode;
    this.onResume = onResume;
    this.onHome = onHome;
    this.onNew = onNew;
    this.onClose = onClose;
    this.onChange = onChange;
    const pause = mode === 'pause';
    const icon = (name) => `assets/icons/${name}-cream.svg`;

    this.root = document.createElement('div');
    this.root.className = 'settings-overlay';
    this.root.innerHTML = `
      <div class="settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header class="settings-head">
          <img src="${icon(pause ? 'pause' : 'settings')}" alt="" width="28" height="28">
          <h2 id="settings-title">${pause ? 'Paused' : 'Settings'}</h2>
          <button type="button" class="settings-x" data-act="close" aria-label="${pause ? 'Resume' : 'Close'}">
            <img src="${icon('x')}" alt="" width="22" height="22">
          </button>
        </header>
        ${pause && run ? SettingsPanel.runChips(run) : ''}
        <div class="settings-rows">
          ${SettingsPanel.row('music', 'Music', icon('music'), true)}
          ${SettingsPanel.row('sfx', 'Sounds', icon('volume-2'), true)}
          ${SettingsPanel.row('calm', 'Calm mode', icon('sparkles'), false)}
          ${SettingsPanel.canVibrate ? SettingsPanel.row('haptics', 'Vibration', icon('vibrate'), false) : ''}
        </div>
        ${
          pause
            ? `<div class="settings-actions">
                <button type="button" class="settings-btn primary" data-act="resume"><img src="assets/icons/play-ink.svg" alt="" width="24" height="24">Resume</button>
                <div class="settings-pair">
                  <button type="button" class="settings-btn" data-act="home"><img src="${icon('house')}" alt="" width="22" height="22">Menu</button>
                  ${run && !run.isDaily ? `<button type="button" class="settings-btn" data-act="new"><img src="${icon('rotate-ccw')}" alt="" width="22" height="22"><span>New</span></button>` : ''}
                </div>
                <p class="settings-note"><img src="${icon('circle-check')}" alt="" width="16" height="16">Your game is saved</p>
              </div>`
            : `<div class="settings-actions">
                <button type="button" class="settings-btn primary" data-act="close"><img src="assets/icons/check-ink.svg" alt="" width="24" height="24">Done</button>
              </div>`
        }
      </div>`;
    ['mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'keydown', 'keyup'].forEach((type) => {
      this.root.addEventListener(type, (e) => e.stopPropagation());
    });
    document.body.append(this.root);
    this.setGameInput(false);

    this.bind();
    this.refresh();
    const first = this.root.querySelector(pause ? '[data-act="resume"]' : '[data-act="close"]');
    if (first) first.focus();
  }

  static get canVibrate() {
    try {
      return typeof navigator.vibrate === 'function' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    } catch (e) {
      return false;
    }
  }

  static row(key, label, iconSrc, slider) {
    const volKey = key === 'music' ? 'musicVol' : 'sfxVol';
    return `
      <div class="settings-row" data-row="${key}">
        <img src="${iconSrc}" alt="" width="26" height="26">
        <span class="settings-label" id="lbl-${key}">${label}</span>
        ${slider ? `<input type="range" min="0" max="100" step="5" class="settings-range" data-vol="${volKey}" aria-label="${label} volume">` : '<span class="settings-spacer"></span>'}
        <button type="button" class="settings-switch" role="switch" data-key="${key}" aria-labelledby="lbl-${key}"><span></span></button>
      </div>`;
  }

  static runChips(run) {
    const hearts = '♥'.repeat(Math.max(0, run.lives)) + '♡'.repeat(Math.max(0, RunState.LIVES - run.lives));
    const round = run.isDaily ? `${run.round}/${RunState.DAILY_ROUNDS}` : String(run.round);
    const modeIcon = run.isDaily ? 'calendar-days' : 'infinity';
    return `
      <div class="settings-run" aria-label="Round ${round}, score ${run.score}, ${run.lives} lives">
        <span class="chip"><img src="assets/icons/${modeIcon}-cream.svg" alt="" width="18" height="18">${round}</span>
        <span class="chip"><img src="assets/icons/star-cream.svg" alt="" width="18" height="18">${run.score}</span>
        <span class="chip hearts" aria-hidden="true">${hearts}</span>
      </div>`;
  }

  bind() {
    this.root.querySelectorAll('.settings-switch').forEach((sw) => {
      sw.addEventListener('click', () => {
        const key = sw.dataset.key;
        Settings.set(key, !Settings.get(key));
        if (key === 'sfx' && Settings.get('sfx')) Sfx.shared.hit();
        if (key === 'haptics' && Settings.get('haptics')) Settings.buzz(30);
        this.refresh();
        if (this.onChange) this.onChange(key);
      });
    });
    this.root.querySelectorAll('.settings-range').forEach((r) => {
      r.addEventListener('input', () => {
        const key = r.dataset.vol;
        Settings.set(key, Number(r.value) / 100);
        // Moving a volume slider turns that sound back on.
        const toggle = key === 'musicVol' ? 'music' : 'sfx';
        if (!Settings.get(toggle) && Number(r.value) > 0) Settings.set(toggle, true);
        this.refresh(false);
      });
      r.addEventListener('change', () => {
        if (r.dataset.vol === 'sfxVol') Sfx.shared.hit();
      });
    });
    this.root.querySelectorAll('[data-act]').forEach((b) => {
      b.addEventListener('click', () => this.act(b.dataset.act, b));
    });
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.act(this.mode === 'pause' ? 'resume' : 'close');
    });
    this.keyHandler = (e) => {
      if (e.key === 'Escape') this.act(this.mode === 'pause' ? 'resume' : 'close');
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  act(what, btn) {
    if (what === 'new') {
      // Tap twice: the first tap asks, the second starts a fresh run.
      if (!this.confirming) {
        this.confirming = true;
        btn.classList.add('warn');
        btn.querySelector('span').textContent = 'Sure?';
        this.confirmTimer = setTimeout(() => {
          this.confirming = false;
          if (btn.isConnected) {
            btn.classList.remove('warn');
            btn.querySelector('span').textContent = 'New';
          }
        }, 3000);
        return;
      }
      clearTimeout(this.confirmTimer);
    }
    const cb = { resume: this.onResume, close: this.onClose || this.onResume, home: this.onHome, new: this.onNew }[what];
    this.close();
    if (cb) cb();
  }

  refresh(updateRanges = true) {
    this.root.querySelectorAll('.settings-switch').forEach((sw) => {
      const on = !!Settings.get(sw.dataset.key);
      sw.setAttribute('aria-checked', String(on));
    });
    if (updateRanges) {
      this.root.querySelectorAll('.settings-range').forEach((r) => {
        r.value = String(Math.round(Settings.get(r.dataset.vol) * 100));
      });
    }
    this.root.querySelectorAll('.settings-range').forEach((r) => {
      const toggle = r.dataset.vol === 'musicVol' ? 'music' : 'sfx';
      r.classList.toggle('off', !Settings.get(toggle));
      r.style.setProperty('--fill', `${r.value}%`);
    });
  }

  setGameInput(on) {
    const input = this.game && this.game.input;
    if (!input) return;
    input.enabled = on;
    if (input.keyboard) input.keyboard.enabled = on;
  }

  close() {
    if (!this.root) return;
    clearTimeout(this.confirmTimer);
    window.removeEventListener('keydown', this.keyHandler);
    this.root.remove();
    this.root = null;
    // Resume input on the next frame so the closing click never lands on the game.
    requestAnimationFrame(() => this.setGameInput(true));
  }
}
