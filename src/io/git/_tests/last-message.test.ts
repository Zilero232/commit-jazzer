import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createTempDir, useTempRepo } from '../../../shared/testing/helpers';
import { readLastMessage, saveLastMessage } from '../last-message';

describe('saveLastMessage and readLastMessage', () => {
  const repo = useTempRepo();

  it('keep the last message inside .git', async () => {
    expect(await readLastMessage({ cwd: repo().path })).toBeUndefined();

    const path = await saveLastMessage({ message: 'fix: 🐛 x', cwd: repo().path });

    expect(path).toBe(join(repo().path, '.git', 'commit-jazzer', 'last-message'));
    expect(await readLastMessage({ cwd: repo().path })).toBe('fix: 🐛 x');
  });

  it('do nothing outside a repository', async () => {
    const plain = await createTempDir();

    expect(await saveLastMessage({ message: 'x', cwd: plain.path })).toBeUndefined();
    expect(await readLastMessage({ cwd: plain.path })).toBeUndefined();
    await plain.remove();
  });
});
