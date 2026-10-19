import { CommanderError } from '@commander-js/extra-typings';

import type { RunCliInput } from './cli.types';

import { createProgram } from './create-program';

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
    // Help, version and argument errors: commander has printed them already.
    if (error instanceof CommanderError) {
      return error.exitCode;
    }

    return (await import('../app')).reportError({ error });
  }
};
