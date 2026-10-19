import { readFile, writeFile } from 'node:fs/promises';
import { isDefined } from 'remeda';

import type { RunHookInput } from './hook.types';

import { exitCodeOf, reportResult, runJazzer } from '../../../app';
import { getCommentChar } from '../../../io/git';
import { logger } from '../../../io/logger';
import { isTerminalInput, openTerminal } from '../../../io/terminal';
import { MESSAGES } from '../../../shared/messages';
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

    if (!isDefined(message)) {
      return exitCodeOf(result);
    }

    // git strips comment lines once the editor closes: its own below the message, and any of ours.
    const commentChar = await getCommentChar();

    if (message.split('\n').some((line) => line.startsWith(commentChar))) {
      logger.warn(MESSAGES.hook.commentLines(commentChar));
    }

    const existing = await readFile(file, 'utf8').catch(() => '');

    await writeFile(file, `${message}\n${existing}`);

    return 0;
  } finally {
    terminal?.close();
  }
};
