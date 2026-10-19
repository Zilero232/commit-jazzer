---
layout: home

hero:
  name: commit-jazzer
  text: Conventional Commits with emoji
  tagline: Pick a type, type a title, get a commit message that commitlint and semantic-release understand.
  image:
    src: /logo.svg
    alt: commit-jazzer
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Try the playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/Zilero232/commit-jazzer

features:
  - title: Fuzzy type search
    details: 43 built-in types with emoji. Type `f` and get `feat` and `fix`; search by description or `:shortcode:` too.
  - title: Valid Conventional Commits
    details: '`type(scope)!: ✨ title`, a wrapped body and `BREAKING CHANGE:` / `Closes #12` footers, checked against commitlint in the tests.'
  - title: CLI, git hook or Commitizen
    details: Run `jazzer`, let `git commit` ask through `prepare-commit-msg`, or keep using `git cz`.
  - title: Scripts and CI
    details: 'Every answer is a flag: `jazzer -t fix -m "handle empty input"`. Without a terminal nothing is asked.'
  - title: Fits your setup
    details: Scopes and limits from your commitlint config, type and ticket from the branch name, aliases for frequent commits.
  - title: Typed config, 13 languages
    details: JSON, TypeScript, JavaScript or `package.json`, with a JSON Schema for autocompletion. Prompts in English, Russian, German, Chinese and 9 more.
---

## What a commit looks like

![jazzer asks for the type, scope, title and description, then commits](/demo.gif)

```text
feat(auth)!: ✨ add login with passkeys

Passkeys replace passwords for new accounts.

BREAKING CHANGE: the /login endpoint no longer accepts passwords
Closes #42
```

```sh
npx commit-jazzer
```
