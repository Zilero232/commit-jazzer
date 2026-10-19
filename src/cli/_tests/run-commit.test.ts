import { chmod, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import type { CommitOptions } from '../cli.types';

import { captureOutput, createTempDir, useTempRepo } from '../../shared/testing/helpers';
import { runCommit } from '../commands/commit/run-commit';

// Without a terminal nothing is asked: the flags answer the required questions, the rest stays empty.
const PRESET = { type: 'feat', component: 'api', title: 'Add login', issues: '7' };

describe('runCommit', () => {
  const repo = useTempRepo();
  let output: ReturnType<typeof captureOutput>;

  const options = (overrides: Partial<CommitOptions> = {}): CommitOptions => ({
    dryRun: false,
    retry: false,
    yes: true,
    preset: PRESET,
    gitArgs: ['--quiet'],
    cwd: repo().path,
    ...overrides
  });

  beforeEach(async () => {
    output = captureOutput();
    await writeFile(join(repo().path, 'jazzer.config.json'), JSON.stringify({ inferFromBranch: false }));
  });

  it('commits the message built from the flags', async () => {
    expect(await runCommit(options())).toBe(0);
    expect(repo().git('log', '-1', '--format=%B')).toBe('feat(api): ✨ add login\n\nCloses #7');
  });

  it('prints the message on a dry run and commits nothing', async () => {
    expect(await runCommit(options({ dryRun: true }))).toBe(0);
    expect(output.stdout()).toBe('feat(api): ✨ add login\n\nCloses #7\n');
    expect(() => repo().git('rev-parse', 'HEAD')).toThrow();
  });

  it('refuses to start when nothing is staged', async () => {
    repo().git('commit', '--quiet', '-m', 'init');

    expect(await runCommit(options())).toBe(1);
    expect(output.stderr()).toContain('Nothing to commit');
  });

  it('checks the stage even when a git option has a value', async () => {
    repo().git('commit', '--quiet', '-m', 'init');

    expect(await runCommit(options({ gitArgs: ['--author', 'Jane <jane@example.com>'] }))).toBe(1);
    expect(output.stderr()).toContain('Nothing to commit');
  });

  it('commits a deleted file given after "--"', async () => {
    repo().git('commit', '--quiet', '-m', 'init');
    await rm(join(repo().path, 'file.txt'));

    expect(await runCommit(options({ gitArgs: ['--quiet', 'file.txt'] }))).toBe(0);
    expect(repo().git('log', '-1', '--format=%s')).toBe('feat(api): ✨ add login');
  });

  it('commits a changed file given after "--" without staging it', async () => {
    repo().git('commit', '--quiet', '-m', 'init');
    await writeFile(join(repo().path, 'file.txt'), 'changed\n');

    expect(await runCommit(options({ gitArgs: ['--quiet', 'file.txt'] }))).toBe(0);
    expect(repo().git('log', '-1', '--format=%s')).toBe('feat(api): ✨ add login');
  });

  it('commits everything with --all when nothing is staged', async () => {
    repo().git('commit', '--quiet', '-m', 'init');
    await writeFile(join(repo().path, 'file.txt'), 'changed\n');

    expect(await runCommit(options({ gitArgs: ['--quiet', '--all'] }))).toBe(0);
  });

  it('retries the last message after a failed commit', async () => {
    // A commit-msg hook rejects the first attempt; --retry reuses the message without questions.
    const hooks = join(repo().path, '.hooks');

    await mkdir(hooks);
    await writeFile(join(hooks, 'commit-msg'), '#!/bin/sh\nexit 1\n');
    await chmod(join(hooks, 'commit-msg'), 0o755);
    repo().git('config', 'core.hooksPath', hooks);

    expect(await runCommit(options())).toBe(1);
    expect(output.stderr()).toContain('jazzer --retry');

    repo().git('config', '--unset', 'core.hooksPath');

    expect(await runCommit(options({ retry: true, preset: {} }))).toBe(0);
    expect(repo().git('log', '-1', '--format=%s')).toBe('feat(api): ✨ add login');

    // Once committed, the message is gone: --retry never repeats a commit that succeeded.
    expect(await runCommit(options({ retry: true, preset: {} }))).toBe(1);
  });

  it('explains when there is nothing to retry', async () => {
    expect(await runCommit(options({ retry: true }))).toBe(1);
    expect(output.stderr()).toContain('No message to retry');
  });

  it('rejects a flag with prohibited words and commits nothing', async () => {
    await expect(runCommit(options({ preset: { ...PRESET, title: 'remove bullshit' } }))).rejects.toMatchObject({
      field: 'title',
      reason: 'The message contains prohibited words: bullshit. Please remove them.'
    });
    expect(() => repo().git('rev-parse', 'HEAD')).toThrow();
  });

  it('names the missing answer when a required flag is left out', async () => {
    await expect(runCommit(options({ preset: { type: 'fix' } }))).rejects.toMatchObject({
      code: 'missing',
      field: 'title'
    });
  });

  it('fails outside a git repository', async () => {
    const plain = await createTempDir();

    expect(await runCommit(options({ cwd: plain.path }))).toBe(1);
    expect(output.stderr()).toContain('Not inside a git repository');
    await plain.remove();
  });
});
