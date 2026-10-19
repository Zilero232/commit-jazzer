import { execFileSync } from 'node:child_process';
import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, vi } from 'vitest';

import type { RunJazzerResult } from '../../app';
import type { JazzerConfig, ResolvedConfig } from '../../core/config';
import type { RunGitInput, TempDir, TempRepo } from './testing.types';

import { parseConfig } from '../../core/config';

export const resolvedConfig = (config: JazzerConfig = {}): ResolvedConfig => parseConfig({ config });

export const okResult = (message: string): RunJazzerResult => ({
  status: 'ok',
  message,
  answers: {},
  config: resolvedConfig()
});

/** A temporary directory with its real path (macOS links /var to /private/var). */
export const createTempDir = async (): Promise<TempDir> => {
  const path = await realpath(await mkdtemp(join(tmpdir(), 'commit-jazzer-')));

  return { path, remove: () => rm(path, { recursive: true, force: true }) };
};

const git = ({ cwd, args }: RunGitInput) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

/** A throwaway repository on branch `main` with one staged file and a local identity. */
const createTempRepo = async (): Promise<TempRepo> => {
  const dir = await createTempDir();

  git({ cwd: dir.path, args: ['init', '--quiet', '--initial-branch=main'] });
  git({ cwd: dir.path, args: ['config', 'user.name', 'Test'] });
  git({ cwd: dir.path, args: ['config', 'user.email', 'test@example.com'] });
  git({ cwd: dir.path, args: ['config', 'commit.gpgsign', 'false'] });
  await writeFile(join(dir.path, 'file.txt'), 'hello\n');
  git({ cwd: dir.path, args: ['add', 'file.txt'] });

  return { ...dir, git: (...args) => git({ cwd: dir.path, args }) };
};

/** Registers a fresh temporary repository for every test of the surrounding `describe`. */
export const useTempRepo = () => {
  const current: { repo?: TempRepo } = {};

  beforeEach(async () => {
    current.repo = await createTempRepo();
  });

  afterEach(async () => {
    await current.repo?.remove();
  });

  return () => {
    if (!current.repo) {
      throw new Error('useTempRepo() is only available inside a test.');
    }

    return current.repo;
  };
};

/** Silences stdout and stderr and records what was written. */
export const captureOutput = () => {
  const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  const text = (spy: typeof stdout) => spy.mock.calls.map(([chunk]) => String(chunk)).join('');

  return { stdout: () => text(stdout), stderr: () => text(stderr) };
};

export type * from './testing.types';
