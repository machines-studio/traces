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
  positionX={number | $signal}
  positionY={number | $signal}
/>
```

| Prop | Type | Values | Default | Effect |
|---|---|---|---|---|
| `mirror` | `boolean` or signal | `true` / `false` | `false` | When active, the second (right) eye's gaze is horizontally mirrored relative to the first (left) eye. Never enabled automatically: the caller is responsible for triggering it (e.g. during a specific screen animation sequence). |
| `positionX` | `number` or signal | `-1` (far left) to `1` (far right) | `null` (disabled) | Drives the pupils' horizontal position continuously/progressively. If `null`/not provided, the default behaviour takes over (gamepad left/right + automatic idle loop, binary -1/0/1 movement). Useful to make the gaze follow a selection among N elements: `positionX = index / (length - 1) * 2 - 1`. Compatible with `mirror` (the right pupil receives `-positionX`). |
| `positionY` | `number` or signal | `-1` (up) to `1` (down) | `null` (no offset) | Drives the pupils' vertical position. No automatic logic attached (no gamepad/idle equivalent for Y) — entirely driven by the caller. |

### CSS variables (`Eyes.scss`, in `:root`)

| Variable | Default | Effect |
|---|---|---|
| `--eyes-width` | `18vw` | Width of one eye. Height (`--eyes-height`) and spacing (`--eyes-gap`) are derived/should be adjusted accordingly if needed. |
| `--eyes-height` | `calc(var(--eyes-width) * 0.5)` | Height of one eye, derived from the width. |
| `--eyes-gap` | `2vw` | Horizontal spacing between the two eyes. |
| `--eyes-pupil-range-x` | `30px` | Max horizontal travel of the pupil (reached when `positionX`/`--position-x` is `-1` or `1`). |
| `--eyes-pupil-range-y` | `12px` | Max vertical travel of the pupil (reached when `positionY`/`--position-y` is `-1` or `1`). |

These variables are global (`:root`) — overridable from any other SCSS file in the project without touching `Eyes.scss`.

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

- None of the newer props (`mirror`, `positionX`, `positionY`) are wired up automatically on an existing screen (`QuestionScreen.jsx`, `IntroductionScreen.jsx`) — they were tested ad hoc and then removed to stay within the `Eyes.jsx`/`Eyes.scss` scope. It's up to the project owner to wire them up where relevant.
- With no props at all, `<Eyes />` keeps 100% of its original behaviour (gamepad + idle loop, binary left/center/right gaze) plus the automatic blinking, which has no prop to disable it.

## Credits

JSX and state utils heavily based on [**pqml**](https://github.com/pqml)’s work.

## License
[MIT.](https://tldrlegal.com/license/mit-license)



