/**
 * Entry point — creates the game in the layout that fits the screen, centred both ways,
 * and switches layout live when the device is rotated or the window is resized.
 */
window.addEventListener('load', () => {
  const start = Layout.detect();
  Layout.current = start;

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#3B0D1C',
    dom: { createContainer: true },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: start.W,
      height: start.H
    },
    scene: [BootScene, PreloadScene, MenuScene, SpinScene, PuzzleScene, WrapScene]
  });
  window.game = game;

  let pending = null;
  const checkLayout = () => {
    clearTimeout(pending);
    pending = setTimeout(() => {
      const next = Layout.detect();
      if (next === Layout.current) {
        Layout.request(null);
        return;
      }
      Layout.request(next);
      game.events.emit('layoutchange', next);
    }, 180);
  };
  window.addEventListener('resize', checkLayout);
  window.addEventListener('orientationchange', checkLayout);

  // Pause all audio while the tab is hidden.
  game.events.on('hidden', () => AudioHub.shared.suspend());
  game.events.on('visible', () => AudioHub.shared.resume());
});
