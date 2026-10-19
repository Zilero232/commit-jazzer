import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { captureOutput, createTempDir, useTempRepo } from '../../shared/testing/helpers';
import { runLint } from '../commands/lint/run-lint';

describe('runLint', () => {
  const repo = useTempRepo();
  let output: ReturnType<typeof captureOutput>;

  beforeEach(() => {
    output = captureOutput();
  });

  const lint = async (message: string, file = 'MSG') => {
    await writeFile(join(repo().path, file), message);

    return runLint({ file, cwd: repo().path });
  };

  it('passes a valid message silently', async () => {
    expect(await lint('feat(api): ✨ add login\n\nCloses #1\n')).toBe(0);
    expect(output.stderr()).toBe('');
  });

  it('fails a message that is not Conventional Commits, explaining why', async () => {
    expect(await lint('added stuff\n')).toBe(1);
    expect(output.stderr()).toContain('The first line must look like "type(scope): subject"');
  });

  it('follows the config of the repository', async () => {
    await writeFile(join(repo().path, '.jazzerrc'), JSON.stringify({ scopes: ['api'], allowCustomScopes: false }));

    expect(await lint('feat(web): ✨ x\n')).toBe(1);
    expect(output.stderr()).toContain('Unknown scope "web"');
  });

  it('reads .git/COMMIT_EDITMSG by default and lets an empty message through to git', async () => {
    await writeFile(join(repo().path, '.git', 'COMMIT_EDITMSG'), '# only comments\n');

    expect(await runLint({ cwd: repo().path })).toBe(0);
  });

  it('needs a file outside a repository', async () => {
    const plain = await createTempDir();

    expect(await runLint({ cwd: plain.path })).toBe(1);
    await plain.remove();
  });
});
