import { readFile, writeFile } from 'node:fs/promises';

import type { RunHookInput } from './hook.types';

import { exitCodeOf, reportResult, runJazzer } from '../../../app';
import { logger } from '../../../io/logger';
import { isTerminalInput, openTerminal } from '../../../io/terminal';
import { SOURCES_WITH_MESSAGE } from './hook.constants';

/**
 * `jazzer hook <file> [<source>]` from `prepare-commit-msg`: writes the message above git's comment lines.
 *
 * Without a terminal (an IDE, a GUI client, Windows) it does nothing and exits with 0,
 * so git goes on with its own editor instead of the commit failing.
 */
export const runHook = async ({ file, source, configPath, open = openTerminal }: RunHookInput): Promise<number> => {
  if (source && SOURCES_WITH_MESSAGE.has(source)) {
    return 0;
  }

  const onStdin = isTerminalInput(process.stdin);
  const terminal = onStdin ? undefined : open();

  if (!onStdin && !terminal) {
    return 0;
  }

  try {
    // git opens the editor on the result anyway, so there is nothing to confirm here.
    const result = await runJazzer({ configPath, context: terminal, interactive: true, confirm: false });
    const message = reportResult(result);

    if (message === undefined) {
      return exitCodeOf(result);
    }

    // git strips `#` lines once the editor closes: its own comments below the message, and any of ours.
    if (message.split('\n').some((line) => line.startsWith('#'))) {
      logger.warn('Lines starting with "#" will be removed by git as comments.');
    }

    const existing = await readFile(file, 'utf8').catch(() => '');

    await writeFile(file, `${message}\n${existing}`);

    return 0;
  } finally {
    terminal?.close();
  }
};
