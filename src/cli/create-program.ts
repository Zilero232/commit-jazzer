import { Command, Option } from '@commander-js/extra-typings';
import { isDefined, isEmpty } from 'remeda';

import type { CommitAnswers } from '../core/message';
import type { AnswerError } from '../core/questions';
import type { CreateProgramInput, ParseCommitOptionsInput, ReportInput, RunCommandInput } from './cli.types';

import { version } from '../../package.json';
import { MESSAGES } from '../shared/messages';
import { FIELD_FLAGS, HELP_FOOTER } from './cli.constants';
import { CommitArgsError, toCommitOptions } from './to-commit-options';

// Answers given as flags: `--retry` commits a saved message and takes none of them.
const ANSWER_OPTIONS = ['type', 'scope', 'title', 'body', 'breaking', 'issues', 'comment', 'alias'];

// The root command alone: `CommitFlags` is inferred from it.
export const createCommitCommand = () =>
  new Command('jazzer')
    .description('Conventional Commits with emoji: ask the questions, then run git commit.')
    .argument('[alias]', 'commit the answers of an alias from the config, written :name')
    .option('-t, --type <type>', 'commit type, e.g. feat')
    .option('-s, --scope <scope>', 'scope')
    .option('-m, --title <title>', 'title')
    .option('-b, --body <text>', 'description; "|" starts a new line')
    .option('--breaking <text>', 'breaking change; adds "!" to the header')
    .option('-i, --issues <ids>', 'related issues, e.g. "12, 34"')
    .option('--comment <text>', 'extra body paragraph')
    .option('--alias <name>', 'same as :name')
    .option('-y, --yes', 'no confirmation; only required questions without a flag are asked')
    .option('-n, --dry-run', 'print the message instead of committing')
    .addOption(new Option('-r, --retry', 'commit the last message again, without questions').conflicts(ANSWER_OPTIONS))
    .option('-c, --config <path>', 'config file to use instead of searching (also JAZZER_CONFIG)')
    .option('--banner', 'show the banner')
    .option('--no-banner', 'hide the banner')
    .option('-a, --all', 'git commit --all')
    .option('--amend', 'git commit --amend')
    .option('--no-verify', 'git commit --no-verify');

// Answers from flags name the flag; others (from an alias, say) name the field.
const describeAnswerError = (preset: CommitAnswers) => (error: AnswerError) => {
  const flag = `--${FIELD_FLAGS[error.field]}`;

  if (error.code === 'missing') {
    return MESSAGES.cli.missingFlag(flag);
  }

  return isDefined(preset[error.field]) ? `${flag}: ${error.reason}` : error.message;
};

// Flags that contradict each other are printed like commander's own argument errors, with the hint to --help.
const parseCommitOptions = ({ command, ...input }: ParseCommitOptionsInput) => {
  try {
    return toCommitOptions(input);
  } catch (error) {
    if (error instanceof CommitArgsError) {
      command.error(`error: ${error.message}`);
    }

    throw error;
  }
};

const report = async ({ error, preset = {} }: ReportInput) =>
  (await import('../app')).reportError({ error, describe: describeAnswerError(preset) });

/**
 * The `jazzer` program: the root command commits, `init`, `hook` and `lint` do the rest.
 * Each command loads its code on use, so `--help` and `--version` stay fast.
 */
export const createProgram = ({ cwd, passthrough, exit }: CreateProgramInput) => {
  // Runs a command and hands its exit code on; an error is reported and exits with 1.
  const run = async ({ command, preset }: RunCommandInput) => {
    exit(await command().catch((error: unknown) => report({ error, preset })));
  };

  const program = createCommitCommand()
    .version(version, '-v, --version')
    .addHelpText('after', HELP_FOOTER)
    .showHelpAfterError(MESSAGES.cli.seeHelp)
    .exitOverride()
    // `jazzer hook MSG -c x.json`: options after a subcommand are that subcommand's, `-c` included.
    .enablePositionalOptions()
    // ...so `jazzer -c x.json lint` or `jazzer lint -- msg` would be ignored without a word: refuse them.
    .hook('preSubcommand', (root, subcommand) => {
      const given = root.options.filter((option) => root.getOptionValueSource(option.attributeName()) === 'cli');

      if (!isEmpty(given)) {
        root.error(`error: ${MESSAGES.cli.optionsBeforeCommand(subcommand.name())}`);
      }

      if (!isEmpty(passthrough)) {
        root.error(`error: ${MESSAGES.cli.passthroughWithCommand(subcommand.name())}`);
      }
    })
    .action(async (alias, flags, command) => {
      const options = parseCommitOptions({ command, alias, flags, passthrough, cwd });

      await run({
        command: async () => (await import('./commands/commit/run-commit')).runCommit(options),
        preset: options.preset
      });
    });

  program
    .command('init')
    .description('create a config in the repository root; install or remove the git hooks')
    .option('--ts', 'write jazzer.config.ts instead of jazzer.config.json')
    .option('--hook', 'install the prepare-commit-msg hook: the questions on git commit')
    .option('--lint', 'install the commit-msg hook: check messages written with git commit -m')
    .addOption(
      new Option('--remove-hook', 'remove the hooks init installed').conflicts(['ts', 'hook', 'lint', 'force'])
    )
    .option('-f, --force', 'replace an existing jazzer.config.json or .ts')
    .action(async ({ ts = false, hook = false, lint = false, removeHook = false, force = false }) => {
      await run({
        command: async () =>
          (await import('./commands/init/run-init')).runInit({ ts, hook, lint, removeHook, force, cwd })
      });
    });

  program
    .command('hook')
    .description('fill the message file from a prepare-commit-msg hook')
    .argument('<file>', 'the message file: the hook\'s "$1"')
    .argument('[source]', 'what the message comes from: the hook\'s "$2"')
    .option('-c, --config <path>', 'config file to use')
    .action(async (file, source, { config }) => {
      await run({
        command: async () => (await import('./commands/hook/run-hook')).runHook({ file, source, configPath: config })
      });
    });

  program
    .command('lint')
    .description('check a commit message against the config')
    .argument('[file]', 'the message file (default: .git/COMMIT_EDITMSG)')
    .option('-c, --config <path>', 'config file to use')
    .action(async (file, { config }) => {
      await run({
        command: async () => (await import('./commands/lint/run-lint')).runLint({ file, configPath: config, cwd })
      });
    });

  return program;
};
