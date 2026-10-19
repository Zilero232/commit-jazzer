import { execFileSync, spawnSync } from 'node:child_process';
import { chmod, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { useTempRepo } from '../../shared/testing/helpers';

// The real command, from argv to a commit: bun runs the TypeScript entry point directly.
const BIN = join(import.meta.dirname, '..', '..', 'bin.ts');

const jazzer = ({ args, cwd }: { args: string[]; cwd: string }) =>
  spawnSync('bun', [BIN, ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

describe('jazzer', () => {
  const repo = useTempRepo();

  it('commits from flags, without a terminal', () => {
    const { status, stderr } = jazzer({
      args: ['-t', 'fix', '-s', 'cli', '-m', 'Handle 007', '-i', '7'],
      cwd: repo().path
    });

    expect(stderr).toBe('');
    expect(status).toBe(0);
    expect(repo().git('log', '-1', '--format=%B')).toBe('fix(cli): 🐛 handle 007\n\nCloses #7');
  });

  it('exits with 1 and names the flag when a required answer is missing', () => {
    const { status, stderr } = jazzer({ args: ['-t', 'fix'], cwd: repo().path });

    expect(status).toBe(1);
    expect(stderr).toContain('Missing answer for --title');
  });

  it('installs hooks that leave a commit without a terminal alone and lint its message', async () => {
    expect(jazzer({ args: ['init', '--hook', '--lint'], cwd: repo().path }).status).toBe(0);

    // The hooks call `commit-jazzer`; put the source build on PATH under that name.
    const bin = join(repo().path, 'bin');

    execFileSync('mkdir', [bin]);
    await writeFile(join(bin, 'commit-jazzer'), `#!/bin/sh\nexec bun ${BIN} "$@"\n`);
    await chmod(join(bin, 'commit-jazzer'), 0o755);

    const env = { ...process.env, PATH: `${bin}:${process.env.PATH ?? ''}` };
    const commit = (message: string) =>
      spawnSync('git', ['commit', '--quiet', '-m', message], {
        cwd: repo().path,
        env,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      });

    expect(commit('added stuff').status).toBe(1);
    expect(commit('chore: ✅ add file').status).toBe(0);
    expect(repo().git('log', '-1', '--format=%s')).toBe('chore: ✅ add file');
  });
});
