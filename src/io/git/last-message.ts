import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { GitInput, SaveLastMessageInput } from './git.types';

import { PACKAGE_NAME } from '../../shared/constants';
import { getGitDir } from './git';

const FILE = join(PACKAGE_NAME, 'last-message');

/**
 * Writes the message to `.git/commit-jazzer/last-message` and returns the path: `git commit -F` reads it,
 * and `--retry` reuses it while the commit has not gone through. `undefined` outside a repository.
 */
export const saveLastMessage = async ({ message, cwd }: SaveLastMessageInput): Promise<string | undefined> => {
  const gitDir = await getGitDir({ cwd });

  if (!gitDir) {
    return undefined;
  }

  const path = join(gitDir, FILE);

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${message}\n`);

  return path;
};

/** The message of the last `jazzer` commit that did not go through; `undefined` when there is none. */
export const readLastMessage = async ({ cwd }: GitInput = {}): Promise<string | undefined> => {
  const gitDir = await getGitDir({ cwd });

  if (!gitDir) {
    return undefined;
  }

  try {
    return (await readFile(join(gitDir, FILE), 'utf8')).trim() || undefined;
  } catch {
    return undefined;
  }
};

/** Forgets the message once it is committed, so `--retry` never repeats a commit that succeeded. */
export const clearLastMessage = async ({ cwd }: GitInput = {}): Promise<void> => {
  const gitDir = await getGitDir({ cwd });

  if (gitDir) {
    await rm(join(gitDir, FILE), { force: true });
  }
};
