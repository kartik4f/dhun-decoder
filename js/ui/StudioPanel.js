/**
 * StudioPanel — test-mode panel over the canvas for trying themes and music live.
 * It also shows the GameConfig line to paste when you are ready to ship.
 * Never shown in final mode.
 */
class StudioPanel {
  constructor({ game, onTheme, onBgm, onClose }) {
    this.game = game;
    this.onTheme = onTheme;
    this.onBgm = onBgm;
    this.onClose = onClose;

    this.root = document.createElement('div');
    this.root.className = 'studio-overlay';
    // Clicks on the panel must not reach the game underneath: Phaser also listens on window
    // for mouse/touch release, which would press whichever button sits below the panel.
    ['mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'keydown', 'keyup'].forEach((type) => {
      this.root.addEventListener(type, (e) => e.stopPropagation());
    });
    this.setGameInput(false);
    this.root.innerHTML = `
      <div class="studio-card" role="dialog" aria-modal="true" aria-labelledby="studio-title">
        <header class="studio-head">
          <img src="assets/icons/palette-cream.svg" alt="" width="26" height="26">
          <h2 id="studio-title">Studio</h2>
          <span class="studio-badge">TEST MODE</span>
          <button type="button" class="studio-close" id="studio-close" aria-label="Close studio">
            <img src="assets/icons/x-cream.svg" alt="" width="24" height="24">
          </button>
        </header>
        <h3 class="studio-label">Theme</h3>
        <div class="studio-grid" id="studio-themes" role="group" aria-label="Theme"></div>
        <h3 class="studio-label">Music</h3>
        <div class="studio-grid" id="studio-bgm" role="group" aria-label="Music"></div>
        <h3 class="studio-label">Ship it</h3>
        <p class="studio-note">Paste into <code>js/config/GameConfig.js</code></p>
        <div class="studio-ship">
          <code id="studio-snippet"></code>
          <button type="button" class="studio-copy" id="studio-copy">Copy</button>
        </div>
      </div>`;
    document.body.append(this.root);

    this.fill('studio-themes', THEMES, () => Studio.theme, (key) => {
      Studio.set('theme', key);
      this.refresh();
      if (this.onTheme) this.onTheme(key);
    });
    this.fill('studio-bgm', BGM_STYLES, () => Studio.bgm, (key) => {
      Studio.set('bgm', key);
      this.refresh();
      if (this.onBgm) this.onBgm(key);
    });

    this.root.querySelector('#studio-close').addEventListener('click', () => this.close());
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.close();
    });
    this.root.querySelector('#studio-copy').addEventListener('click', () => {
      const btn = this.root.querySelector('#studio-copy');
      ShareSheet.copy(Studio.finalSnippet).then((ok) => {
        btn.textContent = ok ? 'Copied' : 'Select it';
      });
    });
    this.keyHandler = (e) => {
      if (e.key === 'Escape') this.close();
    };
    window.addEventListener('keydown', this.keyHandler);
    this.refresh();
    this.root.querySelector('#studio-close').focus();
  }

  fill(id, items, current, pick) {
    const grid = this.root.querySelector(`#${id}`);
    this.grids = this.grids || {};
    this.grids[id] = { current };
    Object.entries(items).forEach(([key, item]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'studio-option';
      b.dataset.key = key;
      b.innerHTML = `<img src="assets/emoji/${EmojiCodes.fileFor(item.emoji)}.svg" alt="" width="40" height="40"><span>${item.name}</span>`;
      b.addEventListener('click', () => pick(key));
      grid.append(b);
    });
  }

  refresh() {
    Object.entries(this.grids).forEach(([id, { current }]) => {
      this.root.querySelectorAll(`#${id} .studio-option`).forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.key === current()));
      });
    });
    this.root.querySelector('#studio-snippet').textContent = Studio.finalSnippet;
    this.root.querySelector('#studio-copy').textContent = 'Copy';
  }

  /** Pause or resume pointer and keyboard input for the game while the panel is open. */
  setGameInput(on) {
    const input = this.game && this.game.input;
    if (!input) return;
    input.enabled = on;
    if (input.keyboard) input.keyboard.enabled = on;
  }

  close() {
    if (!this.root) return;
    window.removeEventListener('keydown', this.keyHandler);
    this.root.remove();
    this.root = null;
    // Resume on the next frame so the closing click itself never lands on the game.
    requestAnimationFrame(() => this.setGameInput(true));
    if (this.onClose) this.onClose();
  }
}
