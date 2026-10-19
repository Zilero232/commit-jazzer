export const HELP = `Conventional Commits with emoji.

Usage
  jazzer [options] [-- <git commit arguments>]      Ask the questions, then run git commit
  jazzer :<alias> [options]                         Commit the answers of an alias from the config
  jazzer init [--ts] [--hook] [--lint] [-f]         Create a config; --hook: questions on git commit,
                                                    --lint: check messages written with git commit -m
  jazzer init --remove-hook                         Remove the hooks init installed
  jazzer lint [<file>] [-c <path>]                  Check a commit message (default: .git/COMMIT_EDITMSG)
  jazzer hook <file> [<source>] [-c <path>]         Fill the message from a prepare-commit-msg hook

Answers (each skips its question; an empty value answers it with nothing)
  -t, --type <type>          Commit type, e.g. feat
  -s, --scope <scope>        Scope
  -m, --title <title>        Title
  -b, --body <text>          Description; "|" starts a new line
      --breaking <text>      Breaking change; adds "!" to the header
  -i, --issues <ids>         Related issues, e.g. "12, 34"
      --comment <text>       Extra body paragraph
      --alias <name>         Same as :<name>

Options
  -y, --yes                  No confirmation; only required questions without a flag are asked
  -n, --dry-run              Print the message instead of committing
  -r, --retry                Commit the last message again, without questions
  -c, --config <path>        Use this config file (also: JAZZER_CONFIG)
      --banner, --no-banner  Show or hide the banner
  -a, --all                  git commit --all
      --amend                git commit --amend
      --no-verify            git commit --no-verify
  -h, --help                 Show this help
  -v, --version              Show the version

Without a terminal (CI, scripts) nothing is asked and nothing is guessed from the branch:
give the required answers (type and title) as flags.

Examples
  jazzer
  jazzer -t fix -s parser -m "handle empty input" -y
  jazzer :deps
  jazzer -n -t docs -m "fix typos"
  jazzer -- -S --author "Jane <jane@example.com>" src/parser.ts`;
