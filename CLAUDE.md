# commit-jazzer

Interactive Conventional Commits with emoji: a CLI (`jazzer`), a `prepare-commit-msg` hook and a Commitizen adapter. Published to npm as an ESM package; `index.cjs` is the CommonJS shim Commitizen loads.

## Commands

- `bun run verify` typecheck + lint + format check + spelling + knip; `bun run fix` applies lint and format fixes
- `bun run test` runs Vitest (never `bun test`); `bun run build` builds `dist/` and the JSON Schema
- `bun run docs:dev` / `docs:build` for the VitePress site in `docs/`
- Toolchain from `mise.toml`; run tools through `mise x --` when they are not on PATH

## Code

- Layers: `core/` is pure, `io/` does IO, `app/` orchestrates, `cli/` and `commitizen/` are entry points. `core/` never imports the others
- The CLI imports its commands lazily so `--help`/`--version` stay fast (~20 ms); keep heavy imports out of `cli/run-cli.ts`
- Tests that run git get an isolated environment from `src/shared/testing/setup.ts`; use `useTempRepo()` and `captureOutput()`
- One folder per module, kebab-case; one file per unit plus `x.types.ts`, `x.constants.ts`, `x.schema.ts`, `x.utils.ts`, `index.ts`, `_tests/`. Input types live in `x.types.ts`
- `type`, never `interface`; no `as` casts; named arrow exports; two or more params become one `<Fn>Input` object
- Prefer established packages (remeda, ts-pattern, wrap-ansi, …) over hand-written helpers
- Config options live in `src/core/config/config.schema.ts`; `schema.json` is generated from it and `docs/reference/config.md` renders that file
- Translations: every locale in `src/core/i18n/locales/` has the keys of `en.json` (tested)
- The message must stay valid Conventional Commits; `src/core/message/_tests/conventional-compatibility.test.ts` checks it with commitlint and the conventionalcommits parser

## Content and commits

- Code, comments, docs and commits in English; Conventional Commits, enforced by commitlint
- Don't commit or push unless asked
