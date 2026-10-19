import type { AnswerError } from '../core/questions';
import type { CliCommand, RunCliInput } from './args';

import { version } from '../../package.json';
import { CliArgsError, FIELD_FLAGS, parseCliArgs } from './args';
import { HELP } from './cli.constants';

// Answers from flags name the flag; others (from an alias, say) name the field.
const describeAnswerError = (command: CliCommand) => (error: AnswerError) => {
  const fromFlag = command.name === 'commit' && command.options.preset[error.field] !== undefined;
  const flag = `--${FIELD_FLAGS[error.field]}`;

  if (error.code === 'missing') {
    return `Missing answer for ${flag}: there is no terminal to ask in.`;
  }

  return fromFlag ? `${flag}: ${error.reason}` : error.message;
};

/**
 * Runs the CLI and resolves with the exit code; never throws.
 *
 * `--help` and `--version` load nothing else: the commands, and with them zod and the prompts, are imported on use.
 */
export const runCli = async ({ argv, cwd }: RunCliInput): Promise<number> => {
  let command: CliCommand | undefined;

  try {
    command = parseCliArgs(argv);

    switch (command.name) {
      case 'help':
        process.stdout.write(`${HELP}\n`);

        return 0;
      case 'version':
        // Inlined at build time; `npm publish` rebuilds after semantic-release bumps the version.
        process.stdout.write(`${version}\n`);

        return 0;
      case 'init':
        return await (await import('./commands/init/run-init')).runInit({ ...command.options, cwd });
      case 'hook':
        return await (await import('./commands/hook/run-hook')).runHook(command.options);
      case 'lint':
        return await (await import('./commands/lint/run-lint')).runLint({ ...command.options, cwd });
      case 'commit':
        return await (await import('./commands/commit/run-commit')).runCommit({ ...command.options, cwd });
    }
  } catch (error) {
    if (error instanceof CliArgsError) {
      process.stderr.write(`[commit-jazzer] ${error.message}\nRun \`jazzer --help\` for the options.\n`);

      return 1;
    }

    const { reportError } = await import('../app');

    return reportError({ error, describe: command && describeAnswerError(command) });
  }
};
