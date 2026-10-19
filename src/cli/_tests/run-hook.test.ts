import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TempDir } from '../../shared/testing/helpers';

import { runJazzer } from '../../app/run-jazzer';
import { captureOutput, createTempDir, okResult } from '../../shared/testing/helpers';
import { runHook } from '../commands/hook/run-hook';

vi.mock('../../app/run-jazzer', () => ({ runJazzer: vi.fn() }));

const GIT_TEMPLATE = '\n# Please enter the commit message\n';

// A stand-in for /dev/tty.
const fakeTerminal = () => {
  const streams = { input: new PassThrough(), output: new PassThrough() };
  const terminal = { ...streams, close: vi.fn() };

  return { terminal, open: () => terminal };
};

describe('runHook', () => {
  let dir: TempDir;
  let file: string;

  beforeEach(async () => {
    captureOutput();
    dir = await createTempDir();
    file = join(dir.path, 'COMMIT_EDITMSG');
    await writeFile(file, GIT_TEMPLATE);
    vi.mocked(runJazzer).mockResolvedValue(okResult('fix: 🐛 x'));
  });

  afterEach(async () => {
    await dir.remove();
  });

  // The test runner has no terminal on stdin, like a git hook.
  const run = (overrides: Partial<Parameters<typeof runHook>[0]> = {}) => {
    const { terminal, open } = fakeTerminal();

    return { terminal, done: runHook({ file, open, ...overrides }) };
  };

  it('writes the message above the comments git left', async () => {
    const { done, terminal } = run();

    expect(await done).toBe(0);
    expect(await readFile(file, 'utf8')).toBe(`fix: 🐛 x\n${GIT_TEMPLATE}`);
    expect(runJazzer).toHaveBeenCalledWith(
      expect.objectContaining({ confirm: false, interactive: true, context: terminal })
    );
  });

  it('closes the terminal', async () => {
    const { done, terminal } = run();

    await done;

    expect(terminal.close).toHaveBeenCalledOnce();
  });

  it('exits with 130 when the questions are interrupted', async () => {
    vi.mocked(runJazzer).mockResolvedValue({ status: 'cancelled', interrupted: true });

    expect(await run().done).toBe(130);
    expect(await readFile(file, 'utf8')).toBe(GIT_TEMPLATE);
  });

  it('writes the message when git left no file', async () => {
    const missing = join(dir.path, 'NEW_MSG');

    expect(await runHook({ file: missing, open: fakeTerminal().open })).toBe(0);
    expect(await readFile(missing, 'utf8')).toBe('fix: 🐛 x\n');
  });

  it('lets the commit go on untouched when there is no terminal', async () => {
    expect(await runHook({ file, open: () => undefined })).toBe(0);
    expect(runJazzer).not.toHaveBeenCalled();
    expect(await readFile(file, 'utf8')).toBe(GIT_TEMPLATE);
  });

  it.each(['message', 'merge', 'squash', 'commit', 'template'])('leaves a "%s" commit alone', async (source) => {
    expect(await run({ source }).done).toBe(0);
    expect(runJazzer).not.toHaveBeenCalled();
  });

  it('aborts the commit and keeps the file when the message is blocked', async () => {
    vi.mocked(runJazzer).mockResolvedValue({ status: 'blocked', profaneWords: ['x'], reason: 'Blocked: x' });

    expect(await run().done).toBe(1);
    expect(await readFile(file, 'utf8')).toBe(GIT_TEMPLATE);
  });

  it('passes the config path on', async () => {
    await run({ configPath: 'x.json' }).done;

    expect(runJazzer).toHaveBeenCalledWith(expect.objectContaining({ configPath: 'x.json' }));
  });
});
