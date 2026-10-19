import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { TempDir } from '../../../shared/testing/helpers';

import { ConfigError } from '../../../core/config';
import { createTempDir, useTempRepo } from '../../../shared/testing/helpers';
import { loadConfig } from '../load-config';

const json = (value: unknown) => JSON.stringify(value);

// A git repository inside `parent`.
const createNestedRepo = async (parent: string) => {
  const path = join(parent, 'repo');

  await mkdir(path);
  execFileSync('git', ['init', '--quiet'], { cwd: path });

  return path;
};

describe('loadConfig', () => {
  const repo = useTempRepo();

  it('returns the defaults without a config file', async () => {
    const { config, filepath } = await loadConfig({ cwd: repo().path });

    expect(filepath).toBeUndefined();
    expect(config.language).toBe('en');
  });

  it('reads a JSON config', async () => {
    await writeFile(join(repo().path, 'jazzer.config.json'), json({ language: 'ru' }));

    const { config, filepath } = await loadConfig({ cwd: repo().path });

    expect(config.language).toBe('ru');
    expect(filepath).toBe(join(repo().path, 'jazzer.config.json'));
  });

  it('reads a TypeScript config with a default export', async () => {
    await writeFile(
      join(repo().path, 'jazzer.config.ts'),
      "const language: 'es' = 'es';\nexport default { language, scopes: ['api'] };\n"
    );

    expect((await loadConfig({ cwd: repo().path })).config).toMatchObject({ language: 'es', scopes: ['api'] });
  });

  it('reads a CommonJS config', async () => {
    await writeFile(join(repo().path, '.jazzer.config.cjs'), "module.exports = { issuePrefix: 'Refs' };\n");

    expect((await loadConfig({ cwd: repo().path })).config.issuePrefix).toBe('Refs');
  });

  it('reads the "jazzer" field of package.json and skips a package.json without it', async () => {
    await mkdir(join(repo().path, 'app'));
    await writeFile(join(repo().path, 'app', 'package.json'), json({ name: 'app' }));
    await writeFile(join(repo().path, 'package.json'), json({ name: 'x', jazzer: { language: 'ru' } }));

    expect((await loadConfig({ cwd: join(repo().path, 'app') })).config.language).toBe('ru');
  });

  it('finds the config in a parent directory of the repository', async () => {
    const nested = join(repo().path, 'packages', 'app');

    await mkdir(nested, { recursive: true });
    await writeFile(join(repo().path, '.jazzerrc'), json({ language: 'ru' }));

    expect((await loadConfig({ cwd: nested })).config.language).toBe('ru');
  });

  it('loads an explicit config path relative to cwd', async () => {
    await mkdir(join(repo().path, 'configs'));
    await writeFile(join(repo().path, 'configs', 'custom.json'), json({ language: 'es' }));

    expect((await loadConfig({ cwd: repo().path, configPath: 'configs/custom.json' })).config.language).toBe('es');
  });

  it('loads the file named in JAZZER_CONFIG, relative to cwd', async () => {
    await writeFile(join(repo().path, 'env.json'), json({ language: 'de' }));

    expect((await loadConfig({ cwd: repo().path, env: { JAZZER_CONFIG: 'env.json' } })).config.language).toBe('de');
  });

  it.each([
    ['a missing explicit file', 'missing.json', '', /Config file not found: .*missing\.json/],
    ['a package.json without the field', 'package.json', json({ name: 'x' }), /package\.json has no "jazzer" field/],
    ['a file that is not valid JSON', 'broken.json', '{ language: ', /Could not read .*broken\.json: /]
  ])('explains %s', async (_, name, content, error) => {
    if (content) {
      await writeFile(join(repo().path, name), content);
    }

    await expect(loadConfig({ cwd: repo().path, configPath: name })).rejects.toThrow(error);
  });

  it('names the file of a project config that cannot be read', async () => {
    await writeFile(join(repo().path, '.jazzerrc'), '{ "language": "ru" }\nx');

    await expect(loadConfig({ cwd: repo().path })).rejects.toThrow(/Could not read .*\.jazzerrc: /);
  });

  it('throws a ConfigError naming the file when the config is invalid', async () => {
    await writeFile(join(repo().path, 'jazzer.config.json'), json({ language: 'xx' }));

    await expect(loadConfig({ cwd: repo().path })).rejects.toThrow(ConfigError);
    await expect(loadConfig({ cwd: repo().path })).rejects.toThrow(/jazzer\.config\.json/);
  });

  describe('around the repository', () => {
    let outer: TempDir;

    beforeEach(async () => {
      outer = await createTempDir();
    });

    afterEach(async () => {
      await outer.remove();
    });

    it('does not search above the repository root', async () => {
      // The repository lives in a directory that has a config of its own, like a shared /tmp.
      const nested = await createNestedRepo(outer.path);

      await writeFile(join(outer.path, 'jazzer.config.json'), json({ language: 'ru' }));

      expect((await loadConfig({ cwd: nested })).config.language).toBe('en');
    });

    it('falls back to the user config in $XDG_CONFIG_HOME, then ~/.jazzerrc', async () => {
      await mkdir(join(outer.path, 'commit-jazzer'));
      await writeFile(join(outer.path, '.jazzerrc'), json({ language: 'it' }));

      expect((await loadConfig({ cwd: repo().path, env: { HOME: outer.path } })).config.language).toBe('it');

      await writeFile(join(outer.path, 'commit-jazzer', 'config.json'), json({ language: 'fr' }));

      expect(
        (await loadConfig({ cwd: repo().path, env: { HOME: outer.path, XDG_CONFIG_HOME: outer.path } })).config.language
      ).toBe('fr');
    });

    it('prefers the project config over the user config', async () => {
      await mkdir(join(outer.path, 'commit-jazzer'));
      await writeFile(join(outer.path, 'commit-jazzer', 'config.json'), json({ language: 'fr' }));
      await writeFile(join(repo().path, '.jazzerrc'), json({ language: 'ru' }));

      expect((await loadConfig({ cwd: repo().path, env: { XDG_CONFIG_HOME: outer.path } })).config.language).toBe('ru');
    });
  });
});
