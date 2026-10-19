---
url: /commit-jazzer/reference/api.md
---
# JavaScript API

The package is a CLI first. From JavaScript it offers what configs and Commitizen need; types are included.

## `defineConfig(config)`

Returns the config unchanged and types it, for autocompletion in `jazzer.config.ts` or `.js`:

```ts
import { defineConfig } from 'commit-jazzer';

export default defineConfig({
  scopes: ['api', 'web']
});
```

## `JazzerConfig`

The type of a config, for configs that build the object elsewhere:

```ts
import type { JazzerConfig } from 'commit-jazzer';

const shared: JazzerConfig = { language: 'de' };
```

`CommitJazzerPrompterOptions`, the name from 1.x, still works and is deprecated.

## `BUILT_IN_COMMIT_TYPE_NAMES`

The names of the built-in commit types, e.g. for commitlint's `type-enum` (see [Recipes](/guide/recipes#check-commits-with-commitlint)).

## `prompter`

The Commitizen adapter. Commitizen finds it by itself through `"path": "commit-jazzer"`; you don't call it. `require('commit-jazzer')` returns only this function.

Anything else (running the questions, formatting or linting a message) goes through the CLI: `jazzer --dry-run` prints a message, `jazzer lint` checks one.
