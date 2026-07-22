# tooooools/boilerplate [<img src="https://github.com/tooooools.png?size=100" size="100" align="right">](http://github.com/tooooools/)
> Vite boilerplate with JSX, SCSS, `eslint`, `stylelint` and a test environment.


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

# Preview a production build locally
$ yarn build
$ yarn preview

# Release
$ yarn version
```

`yarn version` bumps `package.json`, tags the commit, and pushes both
(`postversion`). Pushing a tag triggers a GitHub Actions workflow
(`.github/workflows/bump-monorepo.yml`) that automatically opens a commit
on the [Traces monorepo](https://github.com/Creativ-Up/Traces) bumping
this project's submodule pointer to the new tag — no separate deploy step
needed, the monorepo picks up the new version on its own shortly after.

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

## Credits

JSX and state utils heavily based on [**pqml**](https://github.com/pqml)’s work.

## License
[MIT.](https://tldrlegal.com/license/mit-license)



