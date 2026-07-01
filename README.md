# tooooools/boilerplate [<img src="https://github.com/tooooools.png?size=100" size="100" align="right">](http://github.com/tooooools/)
> Vite boilerplate with JSX, SCSS, `eslint`, `stylelint` and a test environment.

<br>

## Installation

### Using as a Github template
[Use this template](https://github.com/tooooools/boilerplate/generate).

### By cloning and unboiling manually
```console
$ git clone https://github.com/tooooools/boilerplate my-app
$ cd my-app
$ npx unboil
$ yarn install
```

## Usage

```bash
# Development
$ yarn start
$ yarn test

# Staging
$ yarn build
$ yarn preview
$ yarn deploy:staging

# Production
$ yarn version
```

## Browser support

```
Chrome >=87
Firefox >=78
Safari >=14
Edge >=88
```
<sup>From [Vite Browser Compatibility](https://vitejs.dev/guide/build.html#browser-compatibility)</sup>

## Eyes component

Quick reference for the public API of the `Eyes` component (props + CSS variables), kept up to date with the current state of the code.

### JSX props

```jsx
<Eyes
  mirror={boolean | $signal}
  lookAt={Element | $signal}
/>
```

| Prop | Type | Values | Default | Effect |
|---|---|---|---|---|
| `mirror` | `boolean` or signal | `true` / `false` | `false` | When active, the second (right) eye's gaze is horizontally mirrored relative to the first (left) eye. Never enabled automatically: the caller is responsible for triggering it (e.g. during a specific screen animation sequence). |
| `lookAt` | DOM `Element` or signal | A DOM element, or `null`/`undefined` | `null` (disabled) | `Eyes` computes the gaze direction towards this element itself (center-to-center delta with `Eyes`, recomputed on `resize`). If `null`/not provided, the default behaviour takes over (gamepad left/right + automatic idle loop). Compatible with `mirror`. The caller only ever hands over an element, never raw coordinates — `Eyes` fully owns the position math internally. |

`positionX`/`positionY` are no longer public props — they're purely internal now, derived from `lookAt`.

### CSS variables (`Eyes.scss`, in `:root`)

| Variable | Default | Effect |
|---|---|---|
| `--eyes-width` | `18vw` | Width of one eye. Height (`--eyes-height`) and spacing (`--eyes-gap`) are derived/should be adjusted accordingly if needed. |
| `--eyes-height` | `calc(var(--eyes-width) * 0.5)` | Height of one eye, derived from the width. |
| `--eyes-gap` | `2vw` | Horizontal spacing between the two eyes. |
| `--eyes-pupil-range-x` | `30px` | Max horizontal travel of the pupil (reached when `--position-x` is `-1` or `1`). |
| `--eyes-pupil-range-y` | `15px` | Max vertical travel of the pupil. Asymmetrical range: `--position-y` goes from `-1` (up) to `3` (down) — the pupil's resting position in the SVG sits near the top of the eye, so it needs more downward travel to visually reach the bottom. |

These variables are global (`:root`) — overridable from any other SCSS file in the project without touching `Eyes.scss`.

### Wiring `lookAt` with `GamepadRow`

`GamepadRow` exposes a `$selection` signal (currently selected DOM element, or `null`), updated automatically on every focus/index change. Pattern used in `QuestionScreen.jsx`:

```jsx
$artworksSelection = $(null)

template () {
  return (
    <>
      <Eyes lookAt={this.$artworksSelection} />
      <GamepadRow ref={this.ref('artworksRow')}>...</GamepadRow>
    </>
  )
}

afterMount () {
  this.watch(this.refs.artworksRow.$selection, selection => {
    this.$artworksSelection.value = selection
  }, { immediate: true })
}
```

### Blinking

Fully automatic, internal behaviour, with no exposed prop or signal — both eyes blink together at a random interval, no wiring required on the caller's side.

| Constant (`Eyes.jsx`) | Value | Effect |
|---|---|---|
| `BLINK_INTERVAL_MIN` | `1000ms` | Minimum delay before the next blink. |
| `BLINK_INTERVAL_MAX` | `6000ms` | Maximum delay before the next blink (interval randomly picked between min and max on each cycle). |
| `BLINK_DURATION_CLOSE` | `90ms` | Duration the eye stays closed before opening back up. |

| CSS variable (`Eyes.scss`) | Effect |
|---|---|
| `--blink-y` | Vertical offset (in px) of the eyelid mask's `<path>` (`.eyes__lid`); `0` = open, `83px` (hardcoded, = the mask's viewBox height) = closed. Asymmetric transition: fast close (90ms, `--easing-ease-accelerate`) via the `.is-blinking` class, slightly slower reopen (220ms, `--easing-ease-smooth`) by default. These two durations aren't exposed as CSS variables — edit `Eyes.scss` directly if they need tuning. |

### Usage notes

- `mirror` isn't wired up automatically on any existing screen — it's up to the project owner to trigger it where relevant.
- `lookAt` is wired up on `QuestionScreen.jsx` (follows `GamepadRow`'s selection) — see "Wiring `lookAt`" above.
- With no props at all, `<Eyes />` keeps 100% of its original behaviour (gamepad + idle loop, binary left/center/right gaze) plus the automatic blinking, which has no prop to disable it.

## Voices component

Animalese-style text-to-sound component. No visual output — purely audio.

Automatically wired into `Caption`: any screen using `<Caption text={...} />` will play the voice sound when the text changes.

> **Browser note:** the Web Audio API requires a prior user interaction before playing sound. The very first text displayed before any click will be silent — this is a browser constraint, not a bug.

### JSX props

```jsx
<Voices
  phrase={string | $signal}
  pitch={number | $signal}
  speed={number | $signal}
  blipsPerWord={number | $signal}
  reverbDuration={number | $signal}
  reverbMix={number | $signal}
/>
```

| Prop | Type | Default | Effect |
|---|---|---|---|
| `phrase` | `string` or signal | `''` | Phrase to play. Any value change triggers the sound automatically. |
| `pitch` | `number` or signal | `1.5` | Voice pitch multiplier. Below `1.0` = deep, above `1.6` = high-pitched. |
| `speed` | `number` or signal | `25` | Duration of one character blip in milliseconds. Lower = faster speech. |
| `blipsPerWord` | `number` or signal | `5` | Plays 1 blip every N letters. `1` = every letter, `2` = every other, etc. Higher = sparser feel. |
| `reverbDuration` | `number` or signal | `0.8` | Reverb impulse length in seconds. `0` = no reverb. |
| `reverbMix` | `number` or signal | `0.5` | Dry/wet reverb mix. `0` = fully dry, `1` = fully wet. |

### Imperative API

```jsx
// Mount with a ref
<Voices ref={this.ref('voices')} />

// Then call speak() directly
this.refs.voices.speak('Hello!')
```

### Sound tweaking

All sound constants are at the top of `Voices.jsx` and commented:

| Constant | Default | Effect |
|---|---|---|
| `DEFAULT_PITCH` | `1.5` | Voice pitch multiplier |
| `DEFAULT_STEP_MS` | `25` | Blip duration in ms |
| `DEFAULT_BLIPS_PER_WORD` | `5` | 1 blip every N letters |
| `DEFAULT_REVERB_DURATION` | `0.8` | Reverb length in seconds |
| `DEFAULT_REVERB_MIX` | `0.5` | Reverb dry/wet mix |
| `FILTER_FREQUENCY` | `900` | Lowpass cutoff in Hz — lower = more muffled |
| `BLIP_GAIN` | `0.3` | Peak volume per blip (0–1) |
| `BLIP_PITCH_DROP` | `0.55` | Pitch ratio at end of blip — below `1.0` = falls (soft), above `1.0` = rises (harsh) |
| `WORD_GAP_MULTIPLIER` | `1.4` | Extra silence between words, as a multiplier of `speed` |

The oscillator type (`osc.type`) is set to `'sine'` for a round/soft sound. Switch to `'triangle'` for warmth, or `'sawtooth'` for a harsher retro feel.

## Credits

JSX and state utils heavily based on [**pqml**](https://github.com/pqml)’s work.

## License
[MIT.](https://tldrlegal.com/license/mit-license)



