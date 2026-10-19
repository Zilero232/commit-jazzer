import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import type { LintOptions } from '../../args';

import { lintMessage, stripComments } from '../../../core/lint';
import { loadConfig } from '../../../io/config-loader';
import { getConfigValue, getGitDir } from '../../../io/git';
import { logger } from '../../../io/logger';

/**
 * `jazzer lint [<file>]`: checks a commit message against the config; `.git/COMMIT_EDITMSG` by default.
 * As a commit-msg hook it catches messages written without the questions, e.g. with `git commit -m`.
 */
export const runLint = async ({ file, configPath, cwd = process.cwd() }: LintOptions): Promise<number> => {
  const gitDir = file ? undefined : await getGitDir({ cwd });
  const path = file ? resolve(cwd, file) : gitDir && join(gitDir, 'COMMIT_EDITMSG');

  if (!path) {
    logger.error('Not inside a git repository: pass the message file, e.g. jazzer lint .git/COMMIT_EDITMSG');

    return 1;
  }

  const message = await readFile(path, 'utf8');

  // `auto` lets git pick a character the message does not use; `#` is what it starts with.
  const setting = await getConfigValue({ key: 'core.commentChar', cwd });
  const commentChar = setting && setting !== 'auto' ? setting : '#';

  // An empty message: git aborts the commit itself.
  if (!stripComments({ message, commentChar }).trim()) {
    return 0;
  }

  const { config } = await loadConfig({ cwd, configPath });
  const issues = lintMessage({ message, config, commentChar });

  issues.forEach(({ message: issue }) => logger.error(issue));

  if (issues.length > 0) {
    logger.info('Write the message with `jazzer`, or fix it and commit again.');
  }

  return issues.length > 0 ? 1 : 0;
};
