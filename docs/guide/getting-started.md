# Getting started

commit-jazzer asks a few questions (type, scope, title, …) and writes a [Conventional Commits](https://www.conventionalcommits.org) message with an emoji. It needs Node.js 22.13 or newer and git.

## Install

::: code-group

```sh [npm]
npm install --save-dev commit-jazzer
```

```sh [pnpm]
pnpm add --save-dev commit-jazzer
```

```sh [yarn]
yarn add --dev commit-jazzer
```

```sh [bun]
bun add --dev commit-jazzer
```

:::

The package installs the command under two names, `jazzer` and `commit-jazzer`. Without installing, use the package name: `npx commit-jazzer`. (`npx jazzer` would download an unrelated package called `jazzer`.)

## Commit

Stage your changes and run:

```sh
npx jazzer
```

It asks the questions, shows the message, and runs `git commit` once you confirm. Options for `git commit` go after `--`:

```sh
npx jazzer -- --no-verify -S
```

A script makes it shorter for the team:

```json
{
  "scripts": {
    "commit": "jazzer"
  }
}
```

## Or let `git commit` ask

With the hook installed, a plain `git commit` asks the questions and opens the editor with the message filled in. `git commit -m "…"`, merges and amends are left alone, and so are commits from IDEs and GUI clients, which have no terminal to ask in.

```sh
npx jazzer init --hook          # install
npx jazzer init --remove-hook   # remove
```

`init --hook` also writes a config to the repository root when there is none. `git commit -m` still skips the questions; `npx jazzer init --lint` adds a `commit-msg` hook that checks those messages with `jazzer lint`.

The hook goes to `.husky/prepare-commit-msg` when the project uses [husky](https://typicode.github.io/husky/), and to git's hooks directory otherwise (`core.hooksPath` is respected). See [Recipes](./recipes#git-hooks) for lefthook and simple-git-hooks.

## Or keep using `git cz`

If the team already runs [Commitizen](https://github.com/commitizen/cz-cli), point it at commit-jazzer:

```json
{
  "config": {
    "commitizen": {
      "path": "commit-jazzer"
    }
  }
}
```

For a global setup, install both packages globally and put the path into `~/.czrc`:

```sh
npm install --global commitizen commit-jazzer
echo '{ "path": "commit-jazzer" }' > ~/.czrc
```

## Configure

Everything works without a config. To change the questions, the types or the format, create one:

```sh
npx jazzer init        # jazzer.config.json
npx jazzer init --ts   # jazzer.config.ts
```

Continue with [Configuration](./configuration), or open the [Playground](/playground) to see how the options change the message.

## Uninstall

```sh
npx jazzer init --remove-hook   # if you installed the hook
npm uninstall commit-jazzer
```

Then delete `jazzer.config.*` and the `config.commitizen` entry of `package.json`, if you added them.
