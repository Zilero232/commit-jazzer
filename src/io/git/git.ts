import { execFile, spawn } from 'node:child_process';
import { constants } from 'node:os';
import { promisify } from 'node:util';
import { isDefined } from 'remeda';

import type { GitCommitInput, GitConfigInput, GitInput, GitPathInput, RunGitInput } from './git.types';

const execFileAsync = promisify(execFile);

/** Runs a git command and resolves with its trimmed stdout, or `undefined` when it fails. */
const git = async ({ args, cwd }: RunGitInput): Promise<string | undefined> => {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd });

    return stdout.trim();
  } catch {
    return undefined;
  }
};

export const isInsideWorkTree = async (input?: GitInput): Promise<boolean> =>
  (await git({ args: ['rev-parse', '--is-inside-work-tree'], ...input })) === 'true';

/** `git diff --cached --quiet` exits with 1 when something is staged; any other failure is not "staged". */
export const hasStagedChanges = async (input?: GitInput): Promise<boolean> => {
  try {
    await execFileAsync('git', ['diff', '--cached', '--quiet'], { cwd: input?.cwd });

    return false;
  } catch (error) {
    return error instanceof Error && 'code' in error && error.code === 1;
  }
};

/** Whether git knows the path: it commits a deleted file too, which no longer exists on disk. */
export const isTracked = async ({ path, cwd }: GitPathInput): Promise<boolean> =>
  isDefined(await git({ args: ['ls-files', '--error-unmatch', '--', path], cwd }));

/** A value of the git config, e.g. `core.commentChar`; `undefined` when it is not set. */
const getConfigValue = ({ key, cwd }: GitConfigInput): Promise<string | undefined> =>
  git({ args: ['config', '--get', key], cwd });

/** git's comment character (`core.commentChar`); `#` when unset or `auto`, which starts as `#`. */
export const getCommentChar = async (input?: GitInput): Promise<string> => {
  const setting = await getConfigValue({ key: 'core.commentChar', ...input });

  return setting && setting !== 'auto' ? setting : '#';
};

/** Absolute path of the `.git` directory; in a worktree, the worktree's own one. */
export const getGitDir = (input?: GitInput): Promise<string | undefined> =>
  git({ args: ['rev-parse', '--absolute-git-dir'], ...input });

/** Root of the work tree. */
export const getTopLevel = (input?: GitInput): Promise<string | undefined> =>
  git({ args: ['rev-parse', '--show-toplevel'], ...input });

/** Where git looks for hooks: respects `core.hooksPath` and linked worktrees. */
export const getHooksDir = (input?: GitInput): Promise<string | undefined> =>
  git({ args: ['rev-parse', '--path-format=absolute', '--git-path', 'hooks'], ...input });

/** Name of the current branch; `undefined` on a detached HEAD. Works before the first commit too. */
export const getCurrentBranch = (input?: GitInput): Promise<string | undefined> =>
  git({ args: ['symbolic-ref', '--quiet', '--short', 'HEAD'], ...input });

/**
 * Runs `git commit -F <file>` with the terminal attached, so hooks, `--edit` and `--patch` work as usual.
 * Resolves with the exit code.
 */
export const gitCommit = ({ messageFile, args = [], cwd }: GitCommitInput): Promise<number> =>
  new Promise((resolve, reject) => {
    const child = spawn('git', ['commit', '-F', messageFile, ...args], { cwd, stdio: 'inherit' });

    child.on('error', reject);
    // Killed by a signal: report it the way a shell does, 128 + the signal number (130 for Ctrl+C).
    child.on('close', (code, signal) => resolve(code ?? 128 + (signal ? constants.signals[signal] : 0)));
  });
