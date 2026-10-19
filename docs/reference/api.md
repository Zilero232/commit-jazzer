# JavaScript API

The package is ESM. Everything below is exported from `commit-jazzer`; types are included.

## `defineConfig(config)`

Returns the config unchanged and types it. Use it in `jazzer.config.ts` or `.js`.

## `runJazzer(options?)`

Runs the whole flow (config, banner, questions, confirmation) and resolves with the result. Committing is up to you.

```ts
import { runJazzer } from 'commit-jazzer';

const result = await runJazzer({ preset: { type: 'docs' }, confirm: false });

if (result.status === 'ok') {
  console.log(result.message);
}
```

| Option                  | Description                                                                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `cwd`                   | Where the config search starts. Default: `process.cwd()`.                                                                               |
| `env`                   | Environment for `JAZZER_CONFIG` and `XDG_CONFIG_HOME`. Default: `process.env`.                                                          |
| `configPath`            | Load this config file instead of searching.                                                                                             |
| `preset`                | Answers given up front: `type`, `component`, `title`, `description`, `breaking`, `issues`, `comment`.                                   |
| `alias`                 | Name of an alias from the config.                                                                                                       |
| `yes`                   | Skip the confirmation and ask only required questions without a preset, as `--yes` does.                                                |
| `interactive`           | Whether questions can be asked. Default: whether stdin is a terminal. Without one nothing is asked and nothing is read from the branch. |
| `showBanner`, `confirm` | Override `showBanner` and `confirmCommit`.                                                                                              |
| `context`               | `{ input, output }` streams for the prompts.                                                                                            |

`status` is `ok` (with `message`, `answers` and `config`), `blocked` (with `profaneWords` and a translated `reason`) or `cancelled` (with `interrupted: true` for Ctrl+C). An answer that cannot be used (missing without a terminal, invalid, an unknown type) throws an `AnswerError` with `code`, `field` and a translated `reason`; an invalid config throws a `ConfigError`.

## `formatMessage({ data, config })`

Builds a message from answers without any prompts. `config` needs `template`, `bodyLineLength`, `breaklineChar`, `issuePrefix` and `lowercaseTitle`; `parseConfig({ config: {} })` gives the defaults.

```ts
import { formatMessage, parseConfig } from 'commit-jazzer';

formatMessage({
  data: { type: 'fix', emoji: '🐛', component: 'parser', title: 'Handle empty input' },
  config: parseConfig({ config: {} })
});
// 'fix(parser): 🐛 handle empty input'
```

## `loadConfig({ cwd?, configPath?, env? })` and `parseConfig({ config, source? })`

`loadConfig` finds the config (as described in [Configuration](/guide/configuration#where-it-is-read-from)), fills it from commitlint, validates it and applies the defaults; `parseConfig` validates an object you already have. Both throw `ConfigError` with every problem listed. `configSchema` is the zod schema behind them.

## `lintMessage({ message, config })`

Checks a finished message and returns a list of `{ rule, message }` issues, empty when the message is fine. It is what `jazzer lint` runs.

## Others

| Export                                                                             |                                                       |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `prompter`                                                                         | The Commitizen adapter.                               |
| `createMessage({ config, answers })`                                               | `formatMessage` plus the profanity settings.          |
| `DEFAULT_COMMIT_TYPES`, `BUILT_IN_COMMIT_TYPE_NAMES`, `resolveCommitTypes(config)` | The built-in types and the list a config produces.    |
| `createProfanityFilter(options)`                                                   | The word filter: `findProfaneWords`, `mask`, `clean`. |
| `COMMIT_FIELDS`, `LANGUAGES`, `DEFAULT_TEMPLATE`                                   | Constants.                                            |
