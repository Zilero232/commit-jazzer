# CLI

The package installs one command under two names: `jazzer` and `commit-jazzer`.

## `jazzer [options] [-- <git commit arguments>]`

Asks the questions, shows the message and runs `git commit`. Exits with git's exit code.

### Answers

Each flag answers its question, which is then not asked. An empty value (`--breaking ""`) answers with nothing. A flag for a question that is not in `availablePromptQuestions` still goes into the message.

| Option                | Answers                                  |
| --------------------- | ---------------------------------------- |
| `-t, --type <type>`   | Commit type, e.g. `feat`.                |
| `-s, --scope <scope>` | Scope (the component).                   |
| `-m, --title <title>` | Title.                                   |
| `-b, --body <text>`   | Description; `\|` starts a new line.     |
| `--breaking <text>`   | Breaking change; adds `!` to the header. |
| `-i, --issues <ids>`  | Related issues, e.g. `"12, 34"`.         |
| `--comment <text>`    | Extra body paragraph.                    |

Flags are validated like typed answers: an unknown type, a scope outside `scopes` with `allowCustomScopes: false`, a title over the limit, a line break in a header field or parentheses in the scope is an error. So is an answer the template never writes (`--breaking` with a template without `{{breaking}}`), and `--retry` with answers.

### Options

| Option                    | Description                                                                      |
| ------------------------- | -------------------------------------------------------------------------------- |
| `-y, --yes`               | No confirmation; only required questions without a flag are asked.               |
| `-n, --dry-run`           | Print the message to stdout instead of committing. Does not need staged changes. |
| `-r, --retry`             | Commit the last message again, without questions.                                |
| `-c, --config <path>`     | Use this config file instead of searching. Also `$JAZZER_CONFIG`.                |
| `--banner`, `--no-banner` | Show or hide the banner for this run.                                            |
| `-a, --all`               | `git commit --all`.                                                              |
| `--amend`                 | `git commit --amend`.                                                            |
| `--no-verify`             | `git commit --no-verify`.                                                        |
| `-h, --help`              | Show the help.                                                                   |
| `-v, --version`           | Show the version.                                                                |

Everything after `--` goes to `git commit` unchanged, files included:

```sh
jazzer -- -S --author "Jane <jane@example.com>"
jazzer -- src/parser.ts
```

Without a terminal (CI, scripts, pipes) nothing is asked and nothing is guessed from the branch: optional answers without a flag stay empty, and a missing required one is an error naming its flag.

## `jazzer :<alias>`

Commits the answers of an [alias](/guide/configuration#frequent-commits) from the config, without questions or confirmation. Answer flags override the alias: `jazzer :deps -i 31`. `--alias <name>` is the same.

## `jazzer init`

Creates `jazzer.config.json` in the root of the repository (the current directory outside one). With a config present it exits with 1, unless `--force` replaces `jazzer.config.json`/`.ts`; with `--hook` or `--lint` it keeps the config and only installs the hooks. A config in `.jazzerrc` or `package.json` is never replaced.

| Option          | Description                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--ts`          | Write `jazzer.config.ts` instead.                                                                                           |
| `--hook`        | Also install the `prepare-commit-msg` hook that asks the questions on `git commit`.                                         |
| `--lint`        | Also install the `commit-msg` hook that runs `jazzer lint` on every message.                                                |
| `--remove-hook` | Remove the hooks `init` installed; hooks written by someone else stay.                                                      |
| `-f, --force`   | Replace `jazzer.config.json` or `jazzer.config.ts` (leaving one of them). Other configs and other hooks are never replaced. |

Hooks go to `.husky/` when husky runs the hooks, and to git's hooks directory otherwise (`core.hooksPath` and worktrees are respected). They run the project's `commit-jazzer`, then a global one, and do nothing when neither is installed.

## `jazzer lint [file]`

Checks a commit message against the config: the `type(scope): subject` header, the type, a closed scope list, a non-empty subject, `headerMaxLength`, the blank line after the header and `bodyLineLength` for body lines. Reads `.git/COMMIT_EDITMSG` without a file. git's comment lines (`core.commentChar`) and the diff of `git commit -v` are ignored; merges, reverts, reapplies and `fixup!` commits pass. Exits with 1 when something is wrong.

| Option                | Description           |
| --------------------- | --------------------- |
| `-c, --config <path>` | Use this config file. |

## `jazzer hook <file> [source]`

Fills the message file from a `prepare-commit-msg` hook; `file` and `source` are the hook's `$1` and `$2`. Commits that already have a message (`message`, `template`, `merge`, `squash`, `commit` sources) and commits without a terminal are left alone.

| Option                | Description           |
| --------------------- | --------------------- |
| `-c, --config <path>` | Use this config file. |

## Exit codes

| Code  | Meaning                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------ |
| `0`   | Committed, printed with `--dry-run`, `init` or `lint` succeeded, or `hook` left a commit alone.                          |
| `1`   | Invalid arguments, config or answers; blocked words; nothing staged; a cancelled confirmation; a message `lint` rejects. |
| other | A failed `git commit`: its own exit code.                                                                                |
| `130` | Interrupted with Ctrl+C.                                                                                                 |
