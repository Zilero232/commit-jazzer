# Recipes

## Git hooks

`jazzer init --hook` writes the hook for you. It runs the project's copy, then a global one, and lets the commit go on when neither is installed.

git gives hooks no terminal on stdin, so the prompts open `/dev/tty`. Where there is none (IDE git panels, GUI clients, Windows) the hook does nothing and git opens its editor as usual.

With another hook manager, run the project's copy the same way:

::: code-group

```sh [husky]
# .husky/prepare-commit-msg
[ -x node_modules/.bin/commit-jazzer ] && exec node_modules/.bin/commit-jazzer hook "$1" "$2"
exit 0
```

```yaml [lefthook]
# lefthook.yml
prepare-commit-msg:
  commands:
    jazzer:
      run: node_modules/.bin/commit-jazzer hook {1} {2}
      interactive: true
```

```json [simple-git-hooks]
{
  "simple-git-hooks": {
    "prepare-commit-msg": "node_modules/.bin/commit-jazzer hook \"$1\" \"$2\""
  }
}
```

:::

## Check messages written without the questions

`git commit -m` skips the questions, so its message can be anything. `jazzer init --lint` adds a `commit-msg` hook that runs `jazzer lint` on every message: the header format, the type, a closed scope list, a non-empty subject and the length limits from your config. Merges, reverts and `fixup!` commits pass as they are. `init --lint` refuses when your template does not start with `{{type}}`, as those messages would never pass.

```text
$ git commit -m "added stuff"
[commit-jazzer] The first line must look like "type(scope): subject", got "added stuff"
```

## Check commits with commitlint

commit-jazzer writes messages that pass `@commitlint/config-conventional`, and reads `scope-enum` and the length limits from your commitlint config (see [Configuration](./configuration#taken-from-commitlint)). Its built-in types go beyond the conventional list, so allow them:

```js
// commitlint.config.mjs or .ts: the CommonJS entry has no BUILT_IN_COMMIT_TYPE_NAMES
import { BUILT_IN_COMMIT_TYPE_NAMES } from 'commit-jazzer';

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', BUILT_IN_COMMIT_TYPE_NAMES],
    // The subject starts with an emoji; commit-jazzer lower-cases the title itself.
    'subject-case': [0]
  }
};
```

## Releases with semantic-release

Use the `conventionalcommits` preset. `!` and `BREAKING CHANGE:` give a major release, `feat` a minor and `fix` a patch. Other types release nothing unless you add rules. Add `{ breaking: true, release: 'major' }` too: the defaults apply only to commits no custom rule matches, and `refactor!:` matches the `refactor` rule, so without it it would only be a patch.

```js
// release.config.js
export default {
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'refactor', release: 'patch' },
          { type: 'security', release: 'patch' },
          { type: 'upgrade', release: 'patch' }
        ]
      }
    ],
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
    '@semantic-release/npm',
    '@semantic-release/github'
  ]
};
```

## Monorepo scopes

Put the config in the repository root; it is found from every package directory. List the packages as scopes, resolved from the config file rather than the current directory:

```ts
// jazzer.config.ts
import { readdirSync } from 'node:fs';
import { defineConfig } from 'commit-jazzer';

export default defineConfig({
  scopes: readdirSync(new URL('./packages', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
  allowCustomScopes: false
});
```

## Scripts, CI and coding agents

Without a terminal nothing is asked. Give the required answers (type and title by default) as flags; optional questions without a flag stay empty:

```sh
jazzer -t fix -s parser -m "handle empty input" -b "Empty files no longer crash the parser." -i 31
```

A missing required answer is an error that names the flag (`Missing answer for --title`). Nothing is guessed from the branch name either. In a terminal, `--yes` skips the confirmation and asks only the required questions without a flag. `--dry-run` prints the message instead of committing; `--retry` commits the last message again after a failed hook.

## Issue keys in the footer

commit-jazzer writes issue keys in the footer. Make the question mandatory and change the word:

```json
{ "issuePrefix": "Refs", "baseQuestionsOptions": [{ "key": "issues", "options": { "required": true } }] }
```

```text
feat(api): ✨ add rate limits

Refs JIRA-118
```

On a branch like `feat/JIRA-118-rate-limits` the key is suggested automatically.
