# Migrating from 1.x

2.0 is a rewrite. These are the changes to check.

## Requirements

- **Node.js 22.13 or newer.** 1.x claimed Node 14 support.
- The package is ESM. `require('commit-jazzer')` still works for Commitizen: it returns `{ prompter }`.

## Message format

The default template changed from

```text
{{type}}: {{emoji}} - {{title}}
```

to a full Conventional Commits message:

```text
{{type}}{{scope}}{{bang}}: {{emoji}} {{title}}

{{description}}
…
```

To keep the old format, set `"template": "{{type}}: {{emoji}} - {{title}}"`; then only the type and the title are asked, as the template writes nothing else.

Other changes in the output:

- The title is lower-cased and loses a trailing period. Set `lowercaseTitle: false` to keep it as typed.
- Values are no longer HTML-escaped: `a & b` stays `a & b` (1.x wrote `a &amp; b`).
- Each related issue gets its own footer line (`Closes #1`, `Closes #2`), so GitHub closes all of them.

## Questions

- The default questions are now `type`, `component`, `title`, `description`, `breaking` and `issues` (1.x: `type`, `title`). Set `availablePromptQuestions` to change them.
- `language` now selects the prompt language; 1.x always asked in Russian.
- An answer with a blocked word is rejected while you type, instead of the commit being aborted after the last question.
- A confirmation step shows the message before committing. Turn it off with `confirmCommit: false` or `--yes`.

## Banner

The banner is off by default, and its default footer (the "give us a star" lines) is gone. Set `"showBanner": true` to get it back; `showBannerOptions.options.footerMessages` adds footer lines.

## Config

- Unknown keys are errors. Fix the reported key or remove it.
- The search for a project config stops at the repository root instead of your home directory. A config in `~` now goes to `~/.config/commit-jazzer/config.json`, `~/.jazzerrc` or `~/.jazzerrc.json`.
- `showBannerOptions` colors are [`util.styleText`](https://nodejs.org/api/util.html#utilstyletextformat-text-options) styles. They have the same names as the chalk colors 1.x used (`blue`, `bgGray`, …); figlet fonts must exist (`Standard`, `Slant`, …).
- New config locations: `package.json` (`jazzer` field), `.jazzerrc`, and `.mts`/`.cts`/`.mjs`/`.cjs` configs.

## Types

- `CommitJazzerPrompterOptions` is now `JazzerConfig` (the old name is still exported, deprecated). Import types from `commit-jazzer`, not from `commit-jazzer/build/types`.
- Use `defineConfig` instead of annotating the object.

## Commit types

Added `chore`. Removed `fix-ci`: Conventional Commits parsers (and semantic-release) cannot read a `-` in a type; write `fix(ci)` instead, and rename custom types with a `-`. New emoji for types whose emoji or shortcode were wrong or duplicated: `review` 👌, `monitor` 🔊, `animation` 💫, `mock` 🤡, `experiment` ⚗️, `legal` 📄. Override them with `baseCommitTypes` if you prefer the old ones.
