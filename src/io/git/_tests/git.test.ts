import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createTempDir, useTempRepo } from '../../../shared/testing/helpers';
import {
  getCurrentBranch,
  getGitDir,
  getHooksDir,
  getTopLevel,
  gitCommit,
  hasStagedChanges,
  isInsideWorkTree
} from '../git';

const repo = useTempRepo();

describe('isInsideWorkTree', () => {
  it('tells a work tree from a plain directory', async () => {
    const plain = await createTempDir();

    expect(await isInsideWorkTree({ cwd: repo().path })).toBe(true);
    expect(await isInsideWorkTree({ cwd: plain.path })).toBe(false);
    await plain.remove();
  });
});

describe('hasStagedChanges', () => {
  it('is true until the staged file is committed', async () => {
    expect(await hasStagedChanges({ cwd: repo().path })).toBe(true);

    repo().git('commit', '--quiet', '-m', 'init');

    expect(await hasStagedChanges({ cwd: repo().path })).toBe(false);
  });
});

describe('getGitDir, getTopLevel and getHooksDir', () => {
  it('return absolute paths', async () => {
    expect(await getGitDir({ cwd: repo().path })).toBe(join(repo().path, '.git'));
    expect(await getTopLevel({ cwd: repo().path })).toBe(repo().path);
    expect(await getHooksDir({ cwd: repo().path })).toBe(join(repo().path, '.git', 'hooks'));
  });

  it('follows core.hooksPath', async () => {
    repo().git('config', 'core.hooksPath', '.githooks');

    expect(await getHooksDir({ cwd: repo().path })).toBe(join(repo().path, '.githooks'));
  });
});

describe('getCurrentBranch', () => {
  it('names the branch, also before the first commit', async () => {
    expect(await getCurrentBranch({ cwd: repo().path })).toBe('main');
  });

  it('is undefined on a detached HEAD', async () => {
    repo().git('commit', '--quiet', '-m', 'init');
    repo().git('checkout', '--quiet', '--detach');

    expect(await getCurrentBranch({ cwd: repo().path })).toBeUndefined();
  });
});

describe('gitCommit', () => {
  it('commits a multi-line message exactly as written in the file', async () => {
    const message = 'feat(api)!: ✨ add `x` & "y"\n\nBREAKING CHANGE: $HOME stays literal';
    const messageFile = join(repo().path, '.git', 'MSG');

    await writeFile(messageFile, `${message}\n`);

    expect(await gitCommit({ messageFile, cwd: repo().path, args: ['--quiet'] })).toBe(0);
    expect(repo().git('log', '-1', '--format=%B')).toBe(message);
  });

  it('resolves with the exit code of a failed commit', async () => {
    const messageFile = join(repo().path, '.git', 'MSG');

    await writeFile(messageFile, 'x\n');
    repo().git('commit', '--quiet', '-m', 'init');

    expect(await gitCommit({ messageFile, cwd: repo().path, args: ['--quiet'] })).not.toBe(0);
  });
});
