import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { captureOutput, useTempRepo } from '../../../shared/testing/helpers';
import { loadCommitlintRules } from '../load-commitlint-rules';
import { loadConfig } from '../load-config';

// A stand-in for the project's own @commitlint/load.
const installFakeCommitlint = async (cwd: string, rules: object) => {
  const dir = join(cwd, 'node_modules', '@commitlint', 'load');

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'package.json'), JSON.stringify({ name: '@commitlint/load', main: 'index.cjs' }));
  await writeFile(join(dir, 'index.cjs'), `module.exports = async () => ({ rules: ${JSON.stringify(rules)} });\n`);
};

describe('loadCommitlintRules', () => {
  const repo = useTempRepo();

  it('is undefined when commitlint is not installed', async () => {
    expect(await loadCommitlintRules({ cwd: repo().path })).toBeUndefined();
  });

  it('loads the rules with the project copy of @commitlint/load', async () => {
    await installFakeCommitlint(repo().path, { 'header-max-length': [2, 'always', 72] });

    expect(await loadCommitlintRules({ cwd: repo().path })).toEqual({ 'header-max-length': [2, 'always', 72] });
  });

  it('finds @commitlint/load through @commitlint/cli, where pnpm keeps it', async () => {
    const cli = join(repo().path, 'node_modules', '@commitlint', 'cli');

    await installFakeCommitlint(cli, { 'header-max-length': [2, 'always', 60] });
    await writeFile(join(cli, 'package.json'), JSON.stringify({ name: '@commitlint/cli', main: 'index.js' }));
    await writeFile(join(cli, 'index.js'), '');

    expect(await loadCommitlintRules({ cwd: repo().path })).toEqual({ 'header-max-length': [2, 'always', 60] });
  });

  it('warns once and goes on when the commitlint config is broken', async () => {
    const output = captureOutput();
    const dir = join(repo().path, 'node_modules', '@commitlint', 'load');

    await installFakeCommitlint(repo().path, {});
    await writeFile(
      join(dir, 'index.cjs'),
      "module.exports = async () => { throw new Error('Cannot use import statement'); };\n"
    );

    expect(await loadCommitlintRules({ cwd: repo().path })).toBeUndefined();
    expect(output.stderr()).toContain('Skipping the commitlint config: Cannot use import statement');
  });

  it('feeds loadConfig, where the jazzer config wins', async () => {
    await installFakeCommitlint(repo().path, {
      'header-max-length': [2, 'always', 72],
      'scope-enum': [2, 'always', ['api']]
    });
    await writeFile(join(repo().path, '.jazzerrc'), JSON.stringify({ headerMaxLength: 90 }));

    expect((await loadConfig({ cwd: repo().path })).config).toMatchObject({
      headerMaxLength: 90,
      scopes: ['api'],
      allowCustomScopes: false
    });
  });

  it('is skipped with useCommitlint: false', async () => {
    await installFakeCommitlint(repo().path, { 'header-max-length': [2, 'always', 72] });
    await writeFile(join(repo().path, '.jazzerrc'), JSON.stringify({ useCommitlint: false }));

    expect((await loadConfig({ cwd: repo().path })).config.headerMaxLength).toBe(100);
  });
});
