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

## Content and configuration

Two files under `public/` (copied verbatim into the build by Vite, at
`build/config.json` and `build/languages/*.json`) drive the deployed
kiosk's behavior and content without touching any component code:

| File | Effect |
|---|---|
| `public/config.json` | Kiosk tuning: session length, gamepad button mapping, particle/voice presets, printer settings, `API.mock`, etc. Loaded once at boot (`Config.js`'s `loadConfig`) and deep-merged into the `Config` module every other file imports from. |
| `public/config.dev.json` | Dev-only overrides on top of `config.json` — deep-merged in *only* when `import.meta.env.DEV` is true (i.e. `yarn start`, never in a production build). Absent/404 is fine, it's optional. |
| `public/languages/{en,fr,nl}.json` | All on-screen and printed text, one file per code listed in `config.json`'s `LANGUAGES` array. `en.json` is the source of truth — see the `translations` debug flag below to check for gaps. |

Editing the built copies directly (`build/config.json`,
`build/languages/*.json`) works on a deployed kiosk without a rebuild, but
gets overwritten by the next `yarn build` — edit the `public/` source
files instead for a change that should survive a rebuild.

## Browser support

```
Chrome >=87
Firefox >=78
Safari >=14
Edge >=88
```
<sup>From [Vite Browser Compatibility](https://vitejs.dev/guide/build.html#browser-compatibility)</sup>

## Debug flags

`?debug=` in the URL takes a comma-separated list of flags (read once at boot into `DEBUG`, `Config.js`). Combine several with commas, e.g. `?debug=recorder,no-iddle`.

| Flag | Effect |
|---|---|
| `translations` | Warns in the console (`checkMissingTranslations()`, `I18N.js`) about any key present in `en.json` but missing from another language. |
| `trace` | Fast-fills `Session.trace` via the real load/commit pipeline instead of playing through the app, so a specific step can be reached directly. Combine with `?step=N` (and optionally `&screen=constellation`). |
| `artworks` | Logs each `Artwork` component's props on render. |
| `recorder` | Jumps straight to the recorder section of `ArtworkScreen` on mount, and plays back the recorded audio after stopping a recording. |
| `no-mic` | Forces `Recorder` into its no-microphone state (as if `getUserMedia` failed), to test the kiosk's fallback UI without unplugging anything. |
| `gamepad` | Logs raw gamepad axes/buttons values as they change. |
| `no-iddle` | Disables the idle timer (`Iddler.js`) so the kiosk never auto-resets to the home screen from inactivity. |

## Credits

JSX and state utils heavily based on [**pqml**](https://github.com/pqml)’s work.

## License
[MIT.](https://tldrlegal.com/license/mit-license)



