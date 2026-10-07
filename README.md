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

## Development

```sh
npm ci
npm run dev     # build the CSS package and open the overview at localhost:5173/overview.html
npm run build   # creates themed CSS in css/ and the self-contained overview site in dist/
npm run lint    # stylelint + prettier
```

The root `overview.html` is a single-page gallery of Bulma elements, form controls,
components, and layout patterns. It includes light/dark/system theme controls and
a compact/comfortable density toggle.
The CI `fluent2-bulma-overview` artifact contains `overview.html` and the bundled
styles, scripts, and font assets needed to view it.

## Folder layout

- `sass/` – Sass sources (`base`, `tokens`, `elements`, `components`, `form`, `layout`, `helpers`, `themes`)
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
