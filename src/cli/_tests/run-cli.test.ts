import { beforeEach, describe, expect, it, vi } from 'vitest';

import { version } from '../../../package.json';
import { AnswerError } from '../../core/questions';
import { captureOutput } from '../../shared/testing/helpers';
import { runCommit } from '../commands/commit/run-commit';
import { runHook } from '../commands/hook/run-hook';
import { runInit } from '../commands/init/run-init';
import { runLint } from '../commands/lint/run-lint';
import { runCli } from '../run-cli';

vi.mock('../commands/commit/run-commit', () => ({ runCommit: vi.fn(async () => 0) }));
vi.mock('../commands/hook/run-hook', () => ({ runHook: vi.fn(async () => 0) }));
vi.mock('../commands/init/run-init', () => ({ runInit: vi.fn(async () => 0) }));
vi.mock('../commands/lint/run-lint', () => ({ runLint: vi.fn(async () => 0) }));

const run = (...argv: string[]) => runCli({ argv, cwd: '/repo' });

describe('runCli', () => {
  let output: ReturnType<typeof captureOutput>;

  beforeEach(() => {
    output = captureOutput();
  });

  it('prints the version', async () => {
    expect(await run('--version')).toBe(0);
    expect(output.stdout()).toBe(`${version}\n`);
  });

  it('prints the help with every command and option', async () => {
    expect(await run('--help')).toBe(0);

    [
      'init [options]',
      'hook [options] <file> [source]',
      'lint [options] [file]',
      '[alias]',
      '--dry-run',
      '--retry',
      '--no-verify',
      'jazzer :deps'
    ].forEach((text) => expect(output.stdout()).toContain(text));
  });

  it('runs each command with its options and the working directory', async () => {
    await run('-n', '-t', 'fix');
    await run('init', '--hook');
    await run('lint', 'MSG');
    await run('hook', 'MSG', 'message', '-c', 'x.json');

    expect(runCommit).toHaveBeenCalledWith(
      expect.objectContaining({ dryRun: true, preset: { type: 'fix' }, cwd: '/repo' })
    );
    expect(runInit).toHaveBeenCalledWith(expect.objectContaining({ hook: true, cwd: '/repo' }));
    expect(runLint).toHaveBeenCalledWith({ file: 'MSG', configPath: undefined, cwd: '/repo' });
    expect(runHook).toHaveBeenCalledWith({ file: 'MSG', source: 'message', configPath: 'x.json' });
  });

  it('fails on bad arguments with a hint, without running anything', async () => {
    expect(await run('innit')).toBe(1);
    expect(output.stderr()).toContain("error: unknown command 'innit'");
    expect(output.stderr()).toContain('jazzer --help');
    expect(runCommit).not.toHaveBeenCalled();
  });

  it("rejects an unknown option in commander's format", async () => {
    expect(await run('--nope')).toBe(1);
    expect(output.stderr()).toContain("error: unknown option '--nope'");
    expect(runCommit).not.toHaveBeenCalled();
  });

  it('passes everything after "--" to git commit untouched', async () => {
    await run('-t', 'fix', '--', '-S', '--', 'src/a.ts');

    expect(runCommit).toHaveBeenCalledWith(expect.objectContaining({ gitArgs: ['-S', '--', 'src/a.ts'] }));
  });

  it('keeps flag values as strings', async () => {
    await run('-i', '31', '-m', '-fix');

    expect(runCommit).toHaveBeenCalledWith(expect.objectContaining({ preset: { issues: '31', title: '-fix' } }));
  });

  it('names the flag in errors about answers given as flags', async () => {
    vi.mocked(runCommit).mockRejectedValueOnce(
      new AnswerError({ code: 'invalid', field: 'component', reason: 'Pick one of: api' })
    );

    expect(await run('-s', 'web')).toBe(1);
    expect(output.stderr()).toContain('--scope: Pick one of: api');
  });

  it('explains a missing required answer with its flag', async () => {
    vi.mocked(runCommit).mockRejectedValueOnce(
      new AnswerError({ code: 'missing', field: 'title', reason: 'no answer' })
    );

    expect(await run('-t', 'fix')).toBe(1);
    expect(output.stderr()).toContain('Missing answer for --title: there is no terminal to ask in.');
  });

  it('reports any other error of a command and exits with 1', async () => {
    vi.mocked(runCommit).mockRejectedValueOnce(new Error('Invalid jazzer.config.json'));

    expect(await run()).toBe(1);
    expect(output.stderr()).toContain('Invalid jazzer.config.json');
  });
});
