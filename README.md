<p align="center">
  <img src="https://zilero232.github.io/commit-jazzer/logo.svg" alt="" width="88" height="88">
</p>

<h1 align="center">commit-jazzer</h1>

<p align="center">
  <b>Conventional Commits with emoji, without remembering the rules.</b><br>
  Pick a type, type a title — get a message commitlint and semantic-release accept.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/commit-jazzer"><img src="https://img.shields.io/npm/v/commit-jazzer?color=7c3aed&logo=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/commit-jazzer"><img src="https://img.shields.io/npm/dm/commit-jazzer?color=7c3aed" alt="npm downloads"></a>
  <a href="https://github.com/Zilero232/commit-jazzer/actions/workflows/checks.yml"><img src="https://img.shields.io/github/actions/workflow/status/Zilero232/commit-jazzer/checks.yml?branch=main&label=checks&logo=github" alt="checks"></a>
  <a href="https://www.conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-fe5196?logo=conventionalcommits&logoColor=white" alt="Conventional Commits"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/commit-jazzer?color=7c3aed" alt="license"></a>
</p>

<p align="center">
  <a href="https://zilero232.github.io/commit-jazzer/">Documentation</a> ·
  <a href="https://zilero232.github.io/commit-jazzer/playground">Playground</a> ·
  <a href="https://zilero232.github.io/commit-jazzer/reference/config">Config options</a> ·
  <a href="https://zilero232.github.io/commit-jazzer/reference/cli">CLI</a>
</p>

<p align="center">
  <img src="https://zilero232.github.io/commit-jazzer/demo.gif" alt="jazzer asks for the type, scope, title and description, then commits feat(auth): ✨ add login with passkeys" width="800">
</p>

## Quick start

```sh
npm install --save-dev commit-jazzer
git add .
npx jazzer
```

> [!NOTE]
> Before installing, try it with `npx commit-jazzer`: `npx jazzer` without the package installed fetches an unrelated package.

Requires Node.js 22.13 or newer.

## Three ways to use it

| You run                                 | What happens                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `npx jazzer`                            | Asks the questions, shows the message, runs `git commit`.                                    |
| `git commit` after `jazzer init --hook` | The `prepare-commit-msg` hook asks the same questions inside plain `git commit`.             |
| `git cz`                                | Works as a Commitizen adapter: `{ "config": { "commitizen": { "path": "commit-jazzer" } } }` |

Messages written by hand can be checked too: `jazzer init --lint` installs a `commit-msg` hook that runs `jazzer lint`.

## What you get

```text
feat(auth)!: ✨ add login with passkeys

Passkeys replace passwords for new accounts.

BREAKING CHANGE: the /login endpoint no longer accepts passwords
Closes #42
```

Valid [Conventional Commits](https://www.conventionalcommits.org): the tests run every message through commitlint and the parser semantic-release uses, so releases and changelogs keep working.

## Features

- **Fuzzy type search.** 43 types with emoji; `f` finds `feat` and `fix`, `bug` finds `fix`.
- **Guesses from the branch.** On `feat/42-passkeys` the type is `feat` and the issue is `#42` before you type anything.
- **Stays within limits.** Reads scopes and length limits from your commitlint config; a counter keeps the header under the limit.
- **Scriptable.** Every answer is a flag, so CI, scripts and AI coding agents commit without prompts.
- **Aliases** for frequent commits: `jazzer :deps` instead of the same five answers every week.
- **Typed config** in JSON, TypeScript, JavaScript or `package.json`, with a JSON Schema for editor autocompletion.
- **13 languages** for the prompts, and an optional profanity filter.

## Scripts, CI and AI agents

Give the answers as flags and nothing is asked. Without a terminal, `-y` is implied.

```sh
npx jazzer -t fix -s parser -m "handle empty input" -i 31 -y
npx jazzer -n -t docs -m "fix typos"     # print the message, do not commit
npx jazzer -- --amend src/parser.ts      # anything after -- goes to git commit
```

## Configure

`npx jazzer init --ts` writes `jazzer.config.ts`:

```ts
import { defineConfig } from 'commit-jazzer';

export default defineConfig({
  scopes: ['api', 'web', 'docs'],
  availableCommitTypes: ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'upgrade'],
  aliases: {
    deps: { type: 'upgrade', component: 'deps', title: 'update dependencies' }
  }
});
```

Every option is in the [config reference](https://zilero232.github.io/commit-jazzer/reference/config). Coming from 1.x? See [Migrating from 1.x](https://zilero232.github.io/commit-jazzer/guide/migration).

## Contributing

Bug reports and pull requests are welcome: start with [CONTRIBUTING.md](CONTRIBUTING.md). Security issues go through [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Artemev Alexandr
