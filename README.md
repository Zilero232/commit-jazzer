# commit-jazzer

[![Checks](https://img.shields.io/github/actions/workflow/status/Zilero232/commit-jazzer/checks.yml?branch=main&label=checks&logo=github)](https://github.com/Zilero232/commit-jazzer/actions/workflows/checks.yml)
[![npm](https://img.shields.io/npm/v/commit-jazzer?logo=npm)](https://www.npmjs.com/package/commit-jazzer)
[![downloads](https://img.shields.io/npm/dm/commit-jazzer)](https://www.npmjs.com/package/commit-jazzer)
[![license](https://img.shields.io/npm/l/commit-jazzer)](LICENSE)

Interactive [Conventional Commits](https://www.conventionalcommits.org) with emoji. Pick a type, type a title, and get a message that commitlint and semantic-release understand. Use it as a CLI, as a git hook, or as a Commitizen adapter.

**[Documentation](https://zilero232.github.io/commit-jazzer/)** · **[Playground](https://zilero232.github.io/commit-jazzer/playground)** · **[Config options](https://zilero232.github.io/commit-jazzer/reference/config)**

```text
feat(auth)!: ✨ add login with passkeys

Passkeys replace passwords for new accounts.

BREAKING CHANGE: the /login endpoint no longer accepts passwords
Closes #42
```

## Features

- Fuzzy search over 43 commit types with emoji: `f` finds `feat` and `fix`, `bug` finds `fix`.
- Scope, breaking change and issue questions, and a header counter that keeps you within commitlint's 100 characters.
- Valid Conventional Commits output, checked against commitlint and the semantic-release parser in the tests.
- Scopes and length limits from your commitlint config; type and ticket suggested from the branch name.
- Every answer as a flag for scripts, CI and coding agents; aliases for frequent commits; `--dry-run` and `--retry`.
- `jazzer lint` and a `commit-msg` hook for messages written with plain `git commit -m`.
- A typed config in JSON, TypeScript, JavaScript or `package.json`, with a JSON Schema for editor autocompletion.
- Prompts in 13 languages, and an optional profanity filter.

## Install

Node.js 22.13 or newer.

```sh
npm install --save-dev commit-jazzer
```

The command is `jazzer` (or `commit-jazzer`). Before installing, try it with `npx commit-jazzer`: `npx jazzer` would fetch an unrelated package.

## Use

Stage your changes, then pick one of:

```sh
npx jazzer                 # ask, confirm, run git commit
npx jazzer init --hook     # make plain `git commit` ask the questions (also writes a config)
npx jazzer init --lint     # check messages of `git commit -m`
```

or keep using `git cz` with Commitizen:

```json
{ "config": { "commitizen": { "path": "commit-jazzer" } } }
```

With every answer as a flag and `-y`, nothing is asked (without a terminal, `-y` is implied):

```sh
npx jazzer -t fix -s parser -m "handle empty input" -i 31 -y
```

## Configure

```sh
npx jazzer init --ts
```

```ts
// jazzer.config.ts
import { defineConfig } from 'commit-jazzer';

export default defineConfig({
  scopes: ['api', 'web', 'docs'],
  availableCommitTypes: ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'upgrade'],
  aliases: {
    deps: { type: 'upgrade', component: 'deps', title: 'update dependencies' }
  }
});
```

See [Configuration](https://zilero232.github.io/commit-jazzer/guide/configuration) and [Migrating from 1.x](https://zilero232.github.io/commit-jazzer/guide/migration).

## Contributing

Bug reports and pull requests are welcome; read [CONTRIBUTING.md](CONTRIBUTING.md) first. Security issues: see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Artemev Alexandr
