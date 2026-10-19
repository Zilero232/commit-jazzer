# Configuration

Without a config commit-jazzer uses the defaults. A config only needs the options you want to change.

## Where it is read from

1. `--config <path>`, or the file in `$JAZZER_CONFIG`; a relative path is relative to the current directory.
2. A project config. The search starts in the current directory and goes up to the root of the git repository; the first match wins:
   - the `jazzer` field of `package.json`
   - `.jazzerrc` or `.jazzerrc.json` (JSON)
   - `.jazzer.config.{json,ts,mts,cts,js,mjs,cjs}`
   - `jazzer.config.{json,ts,mts,cts,js,mjs,cjs}`
3. Your own config, for every repository without one: `~/.config/commit-jazzer/config.{json,ts,…}` (or `$XDG_CONFIG_HOME/commit-jazzer/`), then `~/.jazzerrc` or `~/.jazzerrc.json`.

Command-line flags override the config for one run. A project config wins over the commitlint rules, which win over your own config; the defaults fill the rest.

TypeScript configs need nothing extra: they are loaded with [jiti](https://github.com/unjs/jiti), and `import { defineConfig } from 'commit-jazzer'` works even when the package is installed globally.

::: warning A config file is code
A `.ts` or `.js` config runs when commit-jazzer starts, like an ESLint or Prettier config. In a repository you do not trust, look at its `jazzer.config.*` before committing there, or point `--config` at a JSON file of your own. The search never leaves the repository, so files in parent directories such as `/tmp` are not loaded.
:::

## JSON

```json
{
  "$schema": "./node_modules/commit-jazzer/schema.json",
  "scopes": ["api", "web", "docs"]
}
```

The `$schema` line gives autocompletion and inline errors in VS Code, WebStorm and other editors. Use `https://zilero232.github.io/commit-jazzer/commit-jazzer-schema.json` when the package is not installed locally.

## TypeScript

```ts
import { defineConfig } from 'commit-jazzer';

export default defineConfig({
  scopes: ['api', 'web', 'docs'],
  addCustomCommitTypes: {
    release: { emoji: '🔖', code: ':bookmark:', description: 'Releasing a version' }
  }
});
```

## Validation

The config is checked before the first question. Unknown keys are errors too, so a typo does not pass silently:

```text
[commit-jazzer] Invalid jazzer.config.json:
✖ Unrecognized key: "languge"
```

## Taken from commitlint

When the project has a [commitlint](https://commitlint.js.org) config and `@commitlint/load` or `@commitlint/cli` installed, these rules fill the options your config does not set:

| commitlint rule        | Option                                                                  |
| ---------------------- | ----------------------------------------------------------------------- |
| `type-enum`            | `availableCommitTypes`: the built-in types it lists                     |
| `scope-enum`           | `scopes`; as an error (level 2) it also sets `allowCustomScopes: false` |
| `header-max-length`    | `headerMaxLength`                                                       |
| `body-max-line-length` | `bodyLineLength`                                                        |

Turn it off with `"useCommitlint": false`.

## Suggested from the branch

On a branch such as `feat/PROJ-12-login` or `fix/42-crash`, the type and the issue are preselected; press Enter to accept or change them. The prefix can be a type name or a common variant (`feature`, `bugfix`, `hotfix`, `doc`, `tests`, …); an issue key counts when it is written in capitals. Only in a terminal: scripts and CI get exactly what their flags say. Turn it off with `"inferFromBranch": false`.

## Common changes

### Fewer questions

```json
{ "availablePromptQuestions": ["type", "title"] }
```

The questions are always asked in this order: `type`, `component`, `title`, `description`, `breaking`, `issues`, `comment`.

### A list of scopes

```json
{ "scopes": ["api", "web", "docs"], "allowCustomScopes": false }
```

The scope question becomes a search over the list. With `allowCustomScopes: false` only listed scopes are accepted, from the prompt and from `--scope`.

### Fewer types, changed types, new types

```json
{
  "availableCommitTypes": ["feat", "fix", "docs", "refactor", "test", "chore"],
  "baseCommitTypes": {
    "feat": { "emoji": "🎸" }
  },
  "addCustomCommitTypes": {
    "release": { "emoji": "🔖", "code": ":bookmark:", "description": "Releasing a version" }
  }
}
```

Custom types are always offered, after the built-in ones. Their names use letters, digits and `_`: Conventional Commits parsers read no `-` in a type. The full list is in [Commit types](/reference/commit-types).

### Frequent commits

```json
{
  "aliases": {
    "deps": { "type": "upgrade", "component": "deps", "title": "update dependencies" }
  }
}
```

`jazzer :deps` commits it without questions. Flags still apply: `jazzer :deps -i 31`. Alias types and scopes are checked when the config is loaded.

### Question text and limits

```json
{
  "baseQuestionsOptions": [
    {
      "key": "title",
      "message": "What does this commit do?",
      "options": { "validations": { "length": { "minMessageLength": 10, "maxMessageLength": 60 } } }
    },
    { "key": "issues", "options": { "required": true } }
  ]
}
```

### Language

```json
{ "language": "de" }
```

Supported: `en`, `ru`, `es`, `de`, `fr`, `it`, `pt`, `pl`, `tr`, `uk`, `zh`, `ja`, `ko`.

### Profanity filter

On by default: an answer with a blocked word is rejected while you type. To mask words instead:

```json
{
  "badWordsOptions": {
    "checkHasProfaneWords": false,
    "replaceProfaneWords": true,
    "options": { "additionalBlockWords": ["foo"], "excludedWords": ["hell"], "placeholder": "#" }
  }
}
```

Turn it off with `"validateCommitBadWords": false`.

### Banner and confirmation

```json
{ "showBanner": true, "confirmCommit": false }
```

The banner is off by default and never shown without a terminal. `--banner`, `--no-banner` and `--yes` change these for one run.

Every option with its type and default is listed in [Config options](/reference/config).
