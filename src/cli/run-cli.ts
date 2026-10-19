import { CommanderError } from '@commander-js/extra-typings';

import type { RunCliInput } from './cli.types';

import { MESSAGES } from '../shared/messages';
import { createProgram } from './create-program';
import { CommitArgsError } from './to-commit-options';

/** Runs the `jazzer` command and resolves with the exit code; never throws. */
export const runCli = async ({ argv, cwd }: RunCliInput): Promise<number> => {
  // Everything after `--` goes to `git commit` untouched, files included, so commander never sees it.
  const separator = argv.indexOf('--');
  const own = separator === -1 ? [...argv] : argv.slice(0, separator);
  const passthrough = separator === -1 ? [] : argv.slice(separator + 1);
  let code = 0;

  const program = createProgram({
    cwd,
    passthrough,
    exit: (value) => {
      code = value;
    }
  });

  try {
    await program.parseAsync(own, { from: 'user' });

    return code;
  } catch (error) {
    // commander has printed the help, the version or the error already.
    if (error instanceof CommanderError) {
      return error.exitCode === 0 ? 0 : 1;
    }

    // Arguments commander accepts but that make no sense together, in commander's own format.
    if (error instanceof CommitArgsError) {
      process.stderr.write(`error: ${error.message}\n${MESSAGES.cli.seeHelp}\n`);

      return 1;
    }

    throw error;
  }
};
