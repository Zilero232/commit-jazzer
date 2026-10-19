import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import type { CommitOptions } from '../../args';
import type { IsPathspecInput, ResolvedMessage, StageCheckInput } from './commit.types';

import { exitCodeOf, reportResult, runJazzer } from '../../../app';
import {
  clearLastMessage,
  gitCommit,
  hasStagedChanges,
  isInsideWorkTree,
  isTracked,
  readLastMessage,
  saveLastMessage
} from '../../../io/git';
import { logger } from '../../../io/logger';
import { COMMITS_WITHOUT_STAGE } from './commit.constants';

// A file after `--` commits that file whether it is staged or not: changed, or deleted and still known to git.
const isPathspec = async ({ arg, cwd }: IsPathspecInput) =>
  !arg.startsWith('-') && (existsSync(resolve(cwd, arg)) || (await isTracked({ path: arg, cwd })));

const canCommitWithoutStage = async ({ gitArgs, cwd = process.cwd() }: StageCheckInput) => {
  if (gitArgs.some((arg) => COMMITS_WITHOUT_STAGE.has(arg))) {
    return true;
  }

  const paths = await Promise.all(gitArgs.map((arg) => isPathspec({ arg, cwd })));

  return paths.includes(true);
};

/** The message to commit and the exit code when there is none. */
const resolveMessage = async (options: CommitOptions): Promise<ResolvedMessage> => {
  if (options.retry) {
    const message = await readLastMessage({ cwd: options.cwd });

    if (!message) {
      logger.error('No message to retry: --retry reuses the message of the last `jazzer` commit that failed.');
    }

    return { message, code: 1 };
  }

  const result = await runJazzer({
    cwd: options.cwd,
    configPath: options.configPath,
    showBanner: options.banner,
    alias: options.alias,
    preset: options.preset,
    yes: options.yes,
    confirm: options.dryRun ? false : undefined
  });

  return { message: reportResult(result), code: exitCodeOf(result) };
};

/** `jazzer [options]`: builds the message and runs `git commit`. Resolves with the exit code. */
export const runCommit = async (options: CommitOptions): Promise<number> => {
  const { cwd, dryRun, gitArgs } = options;

  if (!dryRun) {
    if (!(await isInsideWorkTree({ cwd }))) {
      logger.error('Not inside a git repository.');

      return 1;
    }

    // Fail before the questions, not after them.
    if (!(await canCommitWithoutStage({ gitArgs, cwd })) && !(await hasStagedChanges({ cwd }))) {
      logger.error('Nothing to commit: stage your changes with `git add` first, or pass --all.');

      return 1;
    }
  }

  const { message, code: failure } = await resolveMessage(options);

  if (message === undefined) {
    return failure;
  }

  if (dryRun) {
    process.stdout.write(`${message}\n`);

    return 0;
  }

  const messageFile = await saveLastMessage({ message, cwd });

  if (!messageFile) {
    logger.error('Could not find the .git directory to write the message to.');

    return 1;
  }

  const code = await gitCommit({ messageFile, args: gitArgs, cwd });

  // `git commit --dry-run` exits with 0 without committing: the message stays for the real commit.
  if (code === 0 && !gitArgs.includes('--dry-run')) {
    await clearLastMessage({ cwd });
  } else if (code !== 0) {
    logger.warn('git commit failed. Fix the problem and run `jazzer --retry` to commit the same message.');
  }

  return code;
};
