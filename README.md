# fluent2-bulma

> the unofficial marriage between Bulma and Microsoft's Fluent2 design system

A Fluent 2 theme for [Bulma](https://bulma.io) CSS.

**Disclaimer:** this is an unofficial, community project. It is not affiliated with, endorsed by,
or sponsored by Microsoft or the Bulma project. "Fluent", "Segoe UI" and "Microsoft" are trademarks
of their respective owners.

## Install

```sh
npm install @fiammybe/fluent2-bulma bulma
```

`bulma` (`^1.0.4`) is a peer dependency.

## Use

Load Bulma in a lower-priority cascade layer so the Fluent 2 layer can theme its
components. The theme also works with `data-theme` attributes without JavaScript:

```css
@layer bulma, fluent2;
@import url('bulma/css/bulma.css') layer(bulma);
@import url('@fiammybe/fluent2-bulma/css/fluent2-bulma.css');
```

The system uses light colors by default, follows `prefers-color-scheme` when no
theme is selected, and supports explicit `<html data-theme="light">` or
`<html data-theme="dark">`. Its default font stack prefers Segoe UI when
available, then the locally hosted Noto Sans Latin font, before system fonts.
Noto Sans is licensed under SIL OFL 1.1; its license is included alongside the
font files.

Override the brand color at build time through the Sass entry point, or at runtime
with the `--fluent-brand-color` custom property:

```scss
@use '@fiammybe/fluent2-bulma' with (
  $fluent-brand-color: #0f6cbd
);
```

```css
:root {
  --fluent-brand-color: #6750a4;
}
```

Use `@fiammybe/fluent2-bulma/tokens` for the Sass token maps and
`@fiammybe/fluent2-bulma/tokens.css` for the tokens-only stylesheet. The default
compact density uses 2rem controls; add `.is-comfortable` to opt into 2.5rem
controls. Bulma spacing helpers (`p-1` through `p-6`, `m-1` through `m-6`, and
their directional variants) use Fluent spacing values.

### Navigation and overlay interactions

Interactions are opt-in and dependency-free. Import and initialize the ES module
only on pages that use the enhanced components:

```js
import { initFluent2 } from '@fiammybe/fluent2-bulma/js';

const cleanup = initFluent2();
```

The module enhances elements marked with `data-fluent-*`. Without it, navigation
links, menu links, pagination, CSS tooltips, and the inline dialog fallback remain
usable; a native `popover` trigger works without the module in supporting browsers.
`npm run build` emits `js/fluent2.mjs` and enforces a 10 KiB size budget.

The components follow these accessibility patterns:

- **Navbar:** a labelled navigation landmark; the mobile toggle is a button with
  `aria-expanded` and `aria-controls`. Navigation remains visible without JavaScript.
- **Tabs:** enhanced as an automatic-activation tablist. Arrow keys, Home, and End
  move between tabs; without JavaScript the links navigate to visible panels.
- **Menu/dropdown:** the native Popover API is used where available. Its `menu`
  contains `menuitem` links and supports arrow keys, Home, End, and Escape.
- **Breadcrumb:** a labelled navigation landmark with `aria-current="page"` on
  the current location.
- **Pagination:** a labelled navigation landmark with `aria-current="page"` on
  the current page; page links work without JavaScript.
- **Dialog:** a labelled native `<dialog>` opened modally when enhanced. The browser
  provides modal focus containment and Escape handling; the dialog is inline when
  JavaScript is unavailable.
- **Tooltip:** a non-interactive description shown on hover and keyboard focus;
  the enhanced version uses `role="tooltip"` and `aria-describedby`.
- **Toast/MessageBar:** notifications use a polite live region (`role="status"`).
  Static messages remain visible without JavaScript; enhanced toasts stack and
  dismiss after five seconds.
- **Accordion:** use native `<details>` and `<summary>` inside `.fluent-accordion`.
  They work without JavaScript; add `data-fluent-accordion` to close other panels
  when a panel opens, or set it to `multiple` to allow more than one open panel.
- **Switch:** use a labelled native checkbox inside `.fluent-switch`, followed by
  a `.fluent-switch-track` span.
- **Badge, Avatar, Spinner, Skeleton, Divider, and Slider:** use the
  `.fluent-badge`, `.fluent-avatar`, `.fluent-spinner`, `.fluent-skeleton`,
  `.fluent-divider`, and `.fluent-slider` classes. Give loading indicators an
  accessible name and hide decorative skeletons from assistive technology.

These components use Fluent theme tokens; `.is-comfortable` adjusts their sizing
and spacing.
The SVG icon sprite is built from Fluent System Icons at build time. Use a symbol
with an external sprite URL (adjust the URL to where your bundler serves the
package asset):

```html
<svg class="fluent-icon fluent-icon-24" aria-hidden="true">
  <use href="/assets/fluent-icons.svg#search_24_regular"></use>
</svg>
```

The `.fluent-icon-16`, `.fluent-icon-20`, and `.fluent-icon-24` classes set icon
size. The default sprite list is in `icons/default.json`; generate a custom sprite
with `npm run build-icons -- --list path/to/icons.json`. Each list item names an
SVG from the `@fluentui/svg-icons` package's `icons/` directory, such as
`search_24_regular`. The default build writes the sprite as
`public/fluent-icons.svg` during generation. Vite copies that public asset into
the active build output: `css/fluent-icons.svg` for the package stylesheet and
`dist/fluent-icons.svg` for the overview.

## Development

```sh
npm ci
npm run dev     # build the CSS package and open the overview at localhost:5173/overview.html
npm run build   # creates themed CSS, icon sprite, and overview site
npm run build-icons # regenerates the default SVG icon sprite
npm run lint    # stylelint + prettier
npx playwright install chromium # first-time browser setup for end-to-end tests
npm run test:e2e # axe accessibility, keyboard, motion, forced-colors, and visual checks
```

The root `overview.html` is a single-page gallery of Bulma elements, form controls,
components, and layout patterns. It includes light/dark/system theme controls and
a compact/comfortable density toggle.

The `demo/` directory contains a multi-page Northstar community site showcasing
the theme in a realistic CMS-style interface. Run `npm run dev:demo` to open it
locally; `npm run build` also generates its pages under `dist/demo/`.
The CI `fluent2-bulma-overview` artifact contains `overview.html` and the bundled
styles, scripts, and font assets needed to view it.

## Folder layout

- `sass/` – Sass sources (`base`, `tokens`, `elements`, `components`, `form`, `layout`, `helpers`, `themes`)
- `icons/default.json` and `scripts/` – curated icon list and dev-time sprite generator
- `overview.html`, `overview.*` – local component overview page and its styles/interactions
- `css/` – build output (not committed)
- `dist/` – self-contained overview site build output (not committed)
- `docs/decisions/` – decision records

## Browser support

Final releases of Chrome, Edge, Firefox and Safari from the last 2 months. See
[ADR 0003](docs/decisions/0003-browser-support-policy.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE) and [THIRD-PARTY-NOTICES](THIRD-PARTY-NOTICES).
