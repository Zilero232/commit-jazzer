# Contributing

## Reporting a bug

Open an [issue](https://github.com/Zilero232/commit-jazzer/issues/new/choose) with the command you ran, what you expected, what happened, your config, and the output of `node --version` and `npx jazzer --version`.

## Setup

The toolchain is pinned in `mise.toml` (bun for scripts, Node for the CLI and tests).

```sh
git clone https://github.com/Zilero232/commit-jazzer.git
cd commit-jazzer
mise install
bun install
```

Without mise, install the bun and Node versions from `mise.toml` yourself.

## Commands

| Command            |                                                             |
| ------------------ | ----------------------------------------------------------- |
| `bun run build`    | JSON Schema + `dist/` (tsdown, checked by publint)          |
| `bun run test`     | Vitest; `bun run test:coverage` for coverage                |
| `bun run verify`   | typecheck, lint, format check, spelling, unused code (knip) |
| `bun run fix`      | apply lint and format fixes                                 |
| `bun run docs:dev` | the documentation site on localhost                         |
| `bun run commit`   | commit with the CLI built from your checkout                |

`bun run test`, not `bun test`: the tests run on Vitest.

The README demo is recorded with [VHS](https://github.com/charmbracelet/vhs): after `bun run build`, run `mise x vhs ttyd -- vhs scripts/demo/demo.tape` to update `site/public/demo.gif`.

## Code

```text
src/
  core/        pure logic: config schema, commit types, message format, questions, lint, run policy, profanity, i18n
  io/          everything that touches the outside world: git, prompts, terminal, config files, banner, logging
  app/         the flow shared by every entry point (runJazzer) and result reporting
  cli/         the jazzer command: args/ (parsing), commands/ (commit, init, hook, lint)
  commitizen/  the Commitizen adapter
  shared/      constants, styles, the Handlebars compiler, test helpers and setup
```

- `core/` never imports from `io/`, `app/` or `cli/`.
- One folder per module; inside it one file per unit (`build-questions.ts`) plus `x.types.ts`, `x.constants.ts`, `x.schema.ts`, `x.utils.ts`, `index.ts`, and tests in `_tests/`.
- `type`, never `interface`; no `as` casts; named arrow-function exports; two or more parameters become one object.
- Prefer a well-known package (remeda, ts-pattern, …) over a hand-written helper.
- A config option is added in `src/core/config/config.schema.ts` with a `.meta({ description })`: the JSON Schema is generated from it, and the docs page renders that schema.
- A new prompt text goes into every file in `src/core/i18n/locales/`; a test fails otherwise.

## Commits and pull requests

Commit messages follow Conventional Commits, checked by commitlint. Use the tool itself: `bun run commit`.

Before opening a pull request, run `bun run verify` and `bun run test`, and add tests for the change.

## CI and releases

| Workflow                                 | Runs on                | Does                                                                              |
| ---------------------------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| [CI](.github/workflows/ci.yml)           | pull requests          | verify, build, tests on Node 22.13/24/26, a smoke test of the built CLI           |
| [Release](.github/workflows/release.yml) | every push to `main`   | CI, then semantic-release: version from the commits, npm, CHANGELOG, tag, release |
| [Docs](.github/workflows/docs.yml)       | docs changes, releases | builds the site; on `main` deploys it to GitHub Pages                             |

The version comes from the commit types since the last tag: `feat` is a minor, `fix`, `perf`, `refactor` and `upgrade` a patch, `!` or `BREAKING CHANGE:` a major; `docs`, `chore`, `test` and `ci` release nothing. npm trusts `release.yml` by name (trusted publishing), so renaming it means updating the trusted publisher in the package settings on npm.

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md).
