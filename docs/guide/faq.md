# FAQ

## The hook does not ask anything

- The hook skips commits that already have a message: `git commit -m`, `-F`, merges, squashes and `--amend`.
- It also skips commits without a terminal: IDE git panels, GUI clients, and Windows, where Node cannot open the terminal of a hook. git then opens its editor as usual.
- A hook in `.git/hooks` must be executable: `chmod +x .git/hooks/prepare-commit-msg`.
- `core.hooksPath` set by another tool? `jazzer init --hook` writes the hook there; with husky it goes to `.husky/`.
- With `commit.template` set, git reports every commit as a template commit, and the hook leaves those alone.

## `npx jazzer` runs something else

`jazzer` is the command name, not the package name. Before installing, run `npx commit-jazzer`; after `npm install --save-dev commit-jazzer`, `npx jazzer` works too.

## Commitizen uses an old Inquirer. Does that matter?

No. Commitizen passes its Inquirer 8 to the adapter; commit-jazzer ignores it and uses the current `@inquirer` prompts.

## How do I commit with a message I already have?

`git commit -m "…"` as usual. With the hook installed it is left alone.

## A hook rejected my commit. Do I have to answer everything again?

No: `jazzer --retry` commits the last message again. The message of a `jazzer` commit that failed stays in `.git/commit-jazzer/last-message` until a commit goes through. Messages of the hook and of `git cz` are not stored there, but git keeps them in `.git/COMMIT_EDITMSG`.

## Can I use it without a terminal?

Yes. Pass the required answers as flags; see [Scripts, CI and coding agents](./recipes#scripts-ci-and-coding-agents).

## How does it compare to other tools?

As of October 2026, from the documentation of each tool:

|                                 | commit-jazzer                   | [cz-git / czg](https://cz-git.qbb.sh) | [gitmoji-cli](https://github.com/carloscuesta/gitmoji-cli) | [better-commits](https://github.com/Everduin94/better-commits) |
| ------------------------------- | ------------------------------- | ------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| Standalone CLI                  | ✅                              | ✅                                    | ✅                                                         | ✅                                                             |
| Commitizen adapter              | ✅                              | ✅                                    | —                                                          | —                                                              |
| `prepare-commit-msg` hook       | ✅                              | ✅                                    | ✅                                                         | —                                                              |
| Conventional Commits output     | ✅                              | ✅                                    | — (`:emoji: (scope): title`)                               | ✅                                                             |
| Non-interactive flags           | ✅                              | aliases                               | prefill only                                               | ✅                                                             |
| Reads the commitlint config     | scopes, lengths                 | ✅                                    | —                                                          | —                                                              |
| Type and ticket from the branch | ✅                              | via recipe                            | —                                                          | ✅                                                             |
| Config                          | JSON / TS / JS / `package.json` | JS / TS / commitlint config           | JSON / `package.json`                                      | JSONC                                                          |
| Built-in prompt translations    | 13 languages                    | — (texts are configurable)            | —                                                          | —                                                              |
| AI suggestions                  | —                               | ✅                                    | —                                                          | —                                                              |

Pick cz-git if you want AI messages or one config file shared with commitlint; gitmoji-cli if you want gitmoji's own format.

## How do I add a language?

Copy `src/core/i18n/locales/en.json`, translate the values, and add the language to `LANGUAGES` in `src/shared/constants.ts` and to `src/core/i18n/i18n.ts`. A test checks that every language has the same keys and placeholders.
