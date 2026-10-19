import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import type { InitOptions } from '../cli.types';

import { captureOutput, createTempDir, useTempRepo } from '../../shared/testing/helpers';
import { HOOK_MARKER, TS_CONFIG } from '../commands/init/init.constants';
import { runInit } from '../commands/init/run-init';

describe('runInit', () => {
  const repo = useTempRepo();
  let output: ReturnType<typeof captureOutput>;

  beforeEach(() => {
    output = captureOutput();
  });

  const init = (options: Partial<InitOptions> = {}) =>
    runInit({ ts: false, hook: false, lint: false, removeHook: false, force: false, cwd: repo().path, ...options });

  const at = (...parts: string[]) => join(repo().path, ...parts);
  const read = (...parts: string[]) => readFile(at(...parts), 'utf8');
  const isExecutable = async (path: string) => ((await stat(path)).mode & 0o111) !== 0;
  const HOOK = ['.git', 'hooks', 'prepare-commit-msg'];

  it('writes a JSON config with only the $schema line', async () => {
    expect(await init()).toBe(0);
    expect(JSON.parse(await read('jazzer.config.json'))).toEqual({
      $schema: 'https://zilero232.github.io/commit-jazzer/commit-jazzer-schema.json'
    });
  });

  it('writes a TypeScript config with defineConfig', async () => {
    expect(await init({ ts: true })).toBe(0);
    expect(await read('jazzer.config.ts')).toBe(TS_CONFIG);
  });

  it('writes the config into the repository root from a subdirectory', async () => {
    await mkdir(at('src'));

    expect(await init({ cwd: at('src') })).toBe(0);
    expect(existsSync(at('jazzer.config.json'))).toBe(true);
    expect(existsSync(at('src', 'jazzer.config.json'))).toBe(false);
  });

  it('keeps an existing config unless --force is given', async () => {
    await writeFile(at('jazzer.config.json'), '{"language":"ru"}');

    expect(await init()).toBe(1);
    expect(await read('jazzer.config.json')).toBe('{"language":"ru"}');
    expect(output.stderr()).toContain('already exists. Use --force to replace it.');
  });

  it('replaces the JSON config with a TypeScript one on --ts --force, leaving one config', async () => {
    await init();

    expect(await init({ ts: true, force: true })).toBe(0);
    expect(existsSync(at('jazzer.config.ts'))).toBe(true);
    expect(existsSync(at('jazzer.config.json'))).toBe(false);
  });

  it.each([
    ['.jazzerrc', '{"issuePrefix":"Refs"}'],
    ['package.json', '{"name":"x","jazzer":{}}']
  ])('sees a config in %s and never replaces it', async (name, content) => {
    await writeFile(at(name), content);

    expect(await init()).toBe(1);
    expect(await init({ force: true })).toBe(1);
    expect(existsSync(at('jazzer.config.json'))).toBe(false);
    expect(output.stderr()).toContain('holds the config already; edit it there.');
  });

  it('ignores a package.json without the field', async () => {
    await writeFile(at('package.json'), '{"name":"x"}');

    expect(await init()).toBe(0);
  });

  it('installs an executable hook in the hooks directory of git', async () => {
    expect(await init({ hook: true })).toBe(0);
    expect(await read(...HOOK)).toContain('commit-jazzer hook "$1" "$2"');
    expect(await isExecutable(at(...HOOK))).toBe(true);
  });

  it('refuses the lint hook when the template is not Conventional Commits', async () => {
    await writeFile(at('.jazzerrc'), JSON.stringify({ template: '{{emoji}} {{type}}: {{title}}' }));

    expect(await init({ lint: true })).toBe(1);
    expect(existsSync(at('.git', 'hooks', 'commit-msg'))).toBe(false);
    expect(output.stderr()).toContain('does not start with {{type}}');
  });

  it('installs a commit-msg hook that lints with --lint', async () => {
    expect(await init({ lint: true })).toBe(0);
    expect(await read('.git', 'hooks', 'commit-msg')).toContain('commit-jazzer lint "$1"');
  });

  it('follows core.hooksPath', async () => {
    repo().git('config', 'core.hooksPath', '.githooks');

    expect(await init({ hook: true })).toBe(0);
    expect(existsSync(at('.githooks', 'prepare-commit-msg'))).toBe(true);
  });

  it('puts the hook into .husky, also from a subdirectory, when husky runs the hooks', async () => {
    await mkdir(at('.husky', '_'), { recursive: true });
    await mkdir(at('src'));
    repo().git('config', 'core.hooksPath', '.husky/_');

    expect(await init({ hook: true, cwd: at('src') })).toBe(0);
    expect(await isExecutable(at('.husky', 'prepare-commit-msg'))).toBe(true);
    expect(existsSync(at('.husky', '_', 'prepare-commit-msg'))).toBe(false);
  });

  it('warns when .husky exists but git does not run it', async () => {
    await mkdir(at('.husky'));

    expect(await init({ hook: true })).toBe(0);
    expect(existsSync(at('.husky', 'prepare-commit-msg'))).toBe(true);
    expect(output.stderr()).toContain('run `npx husky` once');
  });

  it('adds only the hook to a configured project', async () => {
    await writeFile(at('jazzer.config.json'), '{"language":"ru"}');

    expect(await init({ hook: true })).toBe(0);
    expect(await read('jazzer.config.json')).toBe('{"language":"ru"}');
  });

  it('writes nothing outside a repository when a hook is asked for', async () => {
    const plain = await createTempDir();

    expect(await init({ hook: true, cwd: plain.path })).toBe(1);
    expect(existsSync(join(plain.path, 'jazzer.config.json'))).toBe(false);
    await plain.remove();
  });

  it('never replaces a hook it did not write, even with --force', async () => {
    await writeFile(at(...HOOK), '#!/bin/sh\necho mine\n');

    expect(await init({ hook: true, force: true })).toBe(1);
    expect(await read(...HOOK)).toBe('#!/bin/sh\necho mine\n');
    expect(output.stderr()).toContain('commit-jazzer hook "$1" "$2"');
  });

  it('removes only its own hooks', async () => {
    await init({ hook: true, lint: true });

    expect(await init({ removeHook: true })).toBe(0);
    expect(existsSync(at(...HOOK))).toBe(false);
    expect(existsSync(at('.git', 'hooks', 'commit-msg'))).toBe(false);

    await writeFile(at(...HOOK), '#!/bin/sh\necho mine\n');

    expect(await init({ removeHook: true })).toBe(0);
    expect(existsSync(at(...HOOK))).toBe(true);
    expect(output.stderr()).toContain('No hook from commit-jazzer to remove.');
  });

  it('writes a hook that lets the commit go on when commit-jazzer is not installed', async () => {
    await init({ hook: true });

    expect(await read(...HOOK)).toContain(HOOK_MARKER);
    // An empty PATH: no global commit-jazzer to find either.
    expect(() => execFileSync('/bin/sh', [at(...HOOK), 'MSG'], { cwd: repo().path, env: { PATH: '' } })).not.toThrow();
  });
});
