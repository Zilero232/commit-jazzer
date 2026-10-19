import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { isDefined, isEmpty } from 'remeda';

import type { LintOptions } from '../../cli.types';

import { lintMessage, stripComments } from '../../../core/lint';
import { loadConfig } from '../../../io/config-loader';
import { getCommentChar, getGitDir } from '../../../io/git';
import { logger } from '../../../io/logger';
import { MESSAGES } from '../../../shared/messages';

// The message of the commit being made: what the commit-msg hook gets as "$1".
const defaultMessageFile = async (cwd: string) => {
  const gitDir = await getGitDir({ cwd });

  return gitDir ? join(gitDir, 'COMMIT_EDITMSG') : undefined;
};

/**
 * `jazzer lint [<file>]`: checks a commit message against the config; `.git/COMMIT_EDITMSG` by default.
 * As a commit-msg hook it catches messages written without the questions, e.g. with `git commit -m`.
 */
export const runLint = async ({ file, configPath, cwd = process.cwd() }: LintOptions): Promise<number> => {
  const path = file ? resolve(cwd, file) : await defaultMessageFile(cwd);

  if (!path) {
    logger.error(MESSAGES.lint.notInRepository);

    return 1;
  }

  const message = await readFile(path, 'utf8').catch(() => undefined);

  if (!isDefined(message)) {
    logger.error(MESSAGES.lint.noFile(path));

    return 1;
  }

  const commentChar = await getCommentChar({ cwd });

  // An empty message: git aborts the commit itself.
  if (!stripComments({ message, commentChar }).trim()) {
    return 0;
  }

  const { config } = await loadConfig({ cwd, configPath });
  const issues = lintMessage({ message, config, commentChar });

  if (isEmpty(issues)) {
    return 0;
  }

  issues.forEach(({ message: issue }) => logger.error(issue));
  logger.info(MESSAGES.lint.hint);

  return 1;
};
