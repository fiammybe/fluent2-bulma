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

## Development

```sh
npm ci
npm run build   # sass -> css/fluent2-bulma.css and css/fluent2-bulma.min.css
npm run lint    # stylelint + prettier
```

## Folder layout

- `sass/` – Sass sources (`base`, `tokens`, `elements`, `components`, `form`, `layout`, `helpers`, `themes`)
- `css/` – build output (not committed)
- `docs/decisions/` – decision records

## Browser support

Final releases of Chrome, Edge, Firefox and Safari from the last 2 months. See
[ADR 0003](docs/decisions/0003-browser-support-policy.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE) and [THIRD-PARTY-NOTICES](THIRD-PARTY-NOTICES).
