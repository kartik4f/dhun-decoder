# Dhun Decoder

A solo Phaser 3 puzzle game. Spin an era wheel, then crack a Hindi film song's title from emoji clues before the clock runs out, to an original filmi score.

## Modes

- **Daily reel:** 8 rounds that are the same for everyone each day (seeded wheel results and songs). Round 8 is a Showstopper. Results give a share grid.
- **Endless show:** play until you lose 3 lives. Every 5th round is a Showstopper, and the clock gets 2.5% shorter each round (down to 70%).

## Rules

- Tap or type letters. Every copy of a correct letter appears; a wrong letter costs 4 seconds.
- Hints: show the film (points ×0.75) or reveal a letter (−40, up to 2). Using a hint breaks the combo.
- The clock running out costs a life and resets the combo.
- After each song, **Listen on YouTube** opens a YouTube search for the real song in a new tab.

## Scoring

100 base + up to 200 for speed − 40 per revealed letter, then:

- × 0.75 if the film was shown
- × the wheel modifier (Double ×2, Blitz ×1.5, No hints ×1.5, Vowels free ×0.75, Showstopper ×3)
- × the combo, for clean solves in a row (×1, ×1.25, ×1.5, ×1.75, up to ×2)

Share grid: ⚡ clean and fast · 🟩 clean · 🟨 solved with hints · 🟥 missed

## Lights, camera, action

Every round plays like a film shoot:

1. **Lights!** pops up as you spin, and the spotlights flare and sweep faster.
2. **Camera!** comes with a photo flash and a zoom punch when the wheel lands. The spotlights and stage lights take the era's colour.
3. **Action!** A clapperboard (scene, take, era, twist) drops in behind letterbox bars and snaps shut. The clock only starts on the clap.

During and after a round:

- **Letters:** correct letters throw sparks, two or more at once punch the camera in, and a wrong letter shakes the screen and flashes red.
- **Last ten seconds:** the screen pulses red like a heartbeat, in time with the beeps, while the music speeds up.
- **Solve:** a flash, confetti, a paparazzi burst with shutter clicks, and a hype word:

  | Result | Word |
  |---|---|
  | Solve with hints | Hit! |
  | Fast clean solve | Superhit! |
  | Combo 2 | Zabardast! |
  | Combo 3 | Shandaar! |
  | Combo 4 | Kamaal! |
  | Combo 5+ | Blockbuster! |

- **Miss:** letterbox bars, then the classic triple dramatic zoom onto the answer ("dhan dhan dhaaan") and "Flop!", or "The End" on your last life.
- **Boss round:** the Showstopper gets the triple zoom on its marquee.
- **Wrap screen:** the sign drops in, the score counts up, and a good night ends with paparazzi flashes, confetti and "New record!".

Camera moves, grain flicker and flashes switch off when the device asks for reduced motion.

## The wheel

- **Drag it** to turn it by hand; the flapper clacks over the pegs.
- **Flick it** to spin. A harder flick spins longer, and it spins whichever way you flicked.
- A **tap**, the Spin button or Space gives a standard spin. A flick too weak to spin wobbles back with a hint.
- The face is painted in code: gradient segments, gold dividers, pegs, era names and a Lucide icon for each twist. The rim has 24 multi-colour bulbs that chase, and race while it spins.
- **It sounds physical:** a rolling whirr, axle rumble and sprocket rattle follow the wheel's speed (`ReelRoll`), and every peg snaps past the flapper with a wooden clack that gets fuller as the wheel slows.
- **The music rides the wheel:** a flick sends the groove racing (up to 1.5×). As the wheel slows, the music slows with it, down to half speed as it creeps onto the last peg. When it lands, the music drops back to normal speed on a fresh downbeat with the "Camera!" hit.

## Themes

| Theme | Backdrop | Ambience |
|---|---|---|
| 🎬 Cinema | wall of original abstract posters, red curtains | turning film reels, dust in the light, popcorn and tickets |
| 🎤 Musical | concert hall: LED wall, lighting truss, glossy stage, a crowd with hands up | speaker stacks pumping to the beat with LED level meters, music notes floating up |
| 🎨 Holi | colour-powder clouds and splashes | rising powder puffs, colour bursts |
| 🪔 Diwali | stars, rangoli, marigold toran | flickering diyas, swinging lanterns, fireworks |
| 🎄 Christmas | night sky, snowy hills, pines | twinkling garlands, falling snow, gifts |

Each theme has its own palette, bulb colours and lighting. All backdrops are drawn in code; there are no real film posters or artwork.

**Stage spotlights:** lamps hang from the rig at the top, each a different colour (for example pink, gold and blue in Cinema), and sweep across the stage. Where a beam meets the floor it throws a pool of light that slides with it. When the wheel lands, the centre lamp takes the era's colour while the side lamps keep theirs.

**Lighting:** on WebGL the backdrop uses Phaser's Light2D pipeline. Each spotlight has a point light of its own colour riding down its beam, so the backdrop really is lit in colour where the beams land. A key light sits over the stage and pulses glow behind the marquee and wheel. On the Canvas renderer the same coloured beams, pools and bulbs are drawn, just without the dynamic lighting.

**Bulbs:** marquees, the wheel rim, garlands and the clue header use real bulbs (socket, glass, coloured core and a glow) with chase, alternate, twinkle and all-on patterns. With several colours, the colours travel along the string as it chases.

**Speakers:** the menu has two speaker cabinets with LED level meters, and the Musical theme has full stacks. Their cones punch out on every beat of the music, the cabinets shudder and sound rings ripple out (`Speaker` reads `FilmiScore.pulse()`).

**Clue header:** the emoji box's title is a glossy band (era colour into magenta, violet and teal) with a glint sweeping across it, chasing mini bulbs, the era in the poster font, and an equaliser with a dancing note that bounce to the music.

## Music styles

All four are original and synthesised. Each one speeds up and fills out as the clock runs down.

| Key | Style |
|---|---|
| `keherwa` 🥁 | dhol and tabla groove over a tanpura drone, harmonium motif (96 bpm) |
| `disco` 🪩 | 80s filmi disco: four-on-the-floor, octave bass, synth stabs (118 bpm) |
| `bhangra` 🪘 | dhol chaal with a tumbi riff (112 bpm) |
| `lofi` 🎧 | soft keys, lazy beat and vinyl crackle (78 bpm) |

## Settings, pause and resume

- **Pause:** the pause button in the top bar (or Esc) freezes the round, clock included, and opens the pause menu: **Resume**, **Menu** (the game is kept), and for endless runs **New** (tap twice to confirm).
- **Settings** (pause menu, or the gear on the menu): music on/off and volume, sounds on/off and volume, calm mode (no shakes, zooms or flashes), and vibration on phones that support it. Changes apply at once and are remembered on the device.
- **Mute:** the speaker button on the menu mutes or unmutes everything in one tap.
- **Resume or start new:** the game in progress is saved as you play, when you pause and when you leave the tab. Next time, the menu shows a **Resume** card (round, score, hearts) where the how-to tiles were, and the Endless button becomes **New**. A daily run is resumed from the Daily button, on the same day only. Daily and endless runs are saved separately.

## Test mode and final mode

`js/config/GameConfig.js` decides what players get:

```js
window.GAME_CONFIG = { mode: 'test', theme: 'cinema', bgm: 'keherwa' };
```

- **Test mode (`mode: 'test'`):** the menu shows a palette button and a TEST badge. The palette opens the **Studio**, where you can switch themes and music live; your picks are remembered on that device. The Studio also shows the exact line to paste for shipping, with a Copy button.
- **Final mode (`mode: 'final'`):** no Studio, no badge and no saved overrides. Everyone gets the one theme and one music style written in `GameConfig.js`.

To ship: pick a theme and music in the Studio, copy the line, paste it into `GameConfig.js`, done.

## Portrait and landscape

- The game picks its layout from the screen shape: 720×1280 portrait for upright phones, 1280×720 landscape for desktops, laptops, tablets and rotated phones.
- Phaser's `Scale.FIT` with `CENTER_BOTH` keeps it centred at any size.
- Rotating mid-game rebuilds the current scene in the new layout with its state intact: same song, letters, hints and clock. If the wheel is spinning, the switch waits until it lands.
- Layout logic is in `js/config/Layout.js` and `js/scenes/BaseScene.js`. Each scene positions its UI for both orientations.

## Sound

- All music and effects are original and synthesised with Web Audio in `js/audio/`. There are no audio files and no film recordings.
- **Effects (`Sfx`, `ReelRoll`):** the wheel's rolling sound and peg clacks, a shehnai flourish when you crack a song, the "dhan dhan dhaaan" sting, shutter clicks, whooshes, a clapperboard clap, letter hits and misses, a countdown beep and an end-of-show fanfare.
- One tap on the menu mutes everything; music and sounds each have their own switch and volume in Settings. Audio starts after the first tap, as browsers require.

## Minimal text

The UI leans on icons and motion rather than words: the menu's how-to is three animated tiles (spin, decode, combo), stats are icon badges, hint buttons show an icon and their cost, and results are icon chips.

## Open-source visuals

- **Twemoji** (CC BY 4.0) renders the emoji clues and theme decorations, so they look the same on every device. Only the images the game uses are bundled, in `assets/emoji/`.
- **Lucide** (ISC) provides the icons, recoloured to the palette, in `assets/icons/`.
- **Phaser** particles and Light2D draw the sparks, confetti, snow, powder, fireworks and lighting. Their textures are drawn in code.

See `CREDITS.md` for attribution.

## Run it

Serve the folder with any static server, for example `npx serve .`, then open it. Opening `index.html` directly from disk won't work, because the SVG assets have to be served over http.

## Adding songs

1. Add an entry to `js/data/songDeck.js` with `s` (title), `f` (film) and `e` (emoji clue).
2. Copy any new emoji images from `@twemoji/svg` into `assets/emoji/`. File names are the code points joined by `-`. `js/core/EmojiCodes.js` has the exact rule, and a missing image falls back to the system emoji.
3. Titles with 14 or more letters are also used for Showstopper rounds.

## Layout

```
index.html
css/style.css
assets/emoji/   assets/icons/   assets/licenses/
js/config/      GameConfig, Theme, Themes, Layout, Studio
js/data/        songDeck, wheelData
js/core/        Rng, DailyClock, SaveStore, EmojiCodes, SongPicker, RunState, RunSaver, Settings
js/audio/       AudioHub, Percussion, Sfx, ReelRoll, FilmiScore
js/audio/styles/ BgmKeherwa, BgmDisco, BgmBhangra, BgmLofi
js/ui/          Stage, Backdrop, LightRig, Ambience, BulbRing, Speaker, Marquee, SpinWheel,
                StudioPanel, SettingsPanel, ResumeCard, Badge, HowToStrip, HudBar, TimerBar, ClueCard, LetterBoard,
                KeyPad, TextButton, IconButton, Effects, CinemaFX, Spotlights,
                Clapperboard, HypeText, ListenLink, ShareSheet
js/scenes/      BaseScene, Boot, Preload, Menu, Spin, Puzzle, Wrap
```

## Adding a theme or music style

- **Theme:** add an entry to `THEMES` in `js/config/Themes.js` (palette, bulb colours, ambient and spot light colours), then add its backdrop to `Backdrop.js` and its ambience to `Ambience.js`.
- **Music:** add a class in `js/audio/styles/` with `bpm`, `startBed`, `stopBed` and `step()`, register it in `FilmiScore.STYLES`, add it to `BGM_STYLES`, and list the file in `index.html`.
