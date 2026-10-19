import editor from '@inquirer/editor';
import select from '@inquirer/select';
import { Writable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';

import { getTranslations } from '../../../core/i18n';
import { confirmMessage } from '../confirm-message';

vi.mock('@inquirer/select', () => ({ default: vi.fn() }));
vi.mock('@inquirer/editor', () => ({ default: vi.fn() }));

const translations = getTranslations('en');

const createOutput = () => {
  const chunks: string[] = [];
  const output = new Writable({
    write: (chunk, _, done) => {
      chunks.push(String(chunk));
      done();
    }
  });

  return { output, text: () => chunks.join('') };
};

const confirm = (action: string) => {
  vi.mocked(select).mockResolvedValue(action);
  const { output, text } = createOutput();

  return { result: confirmMessage({ message: 'feat: ✨ x', translations, context: { output } }), text };
};

describe('confirmMessage', () => {
  it('shows the message before asking', async () => {
    const { result, text } = confirm('commit');

    await result;

    expect(text()).toContain('Commit message:');
    expect(text()).toContain('feat: ✨ x');
  });

  it('returns the message when it is committed', async () => {
    expect(await confirm('commit').result).toBe('feat: ✨ x');
  });

  it('returns null when it is cancelled', async () => {
    expect(await confirm('cancel').result).toBeNull();
  });

  it('returns the edited message, trimmed', async () => {
    vi.mocked(editor).mockResolvedValue('  fix: 🐛 y\n\n');

    expect(await confirm('edit').result).toBe('fix: 🐛 y');
    expect(vi.mocked(editor).mock.calls[0]?.[0]).toMatchObject({ default: 'feat: ✨ x' });
  });

  it('returns null when the edited message is empty', async () => {
    vi.mocked(editor).mockResolvedValue('  \n');

    expect(await confirm('edit').result).toBeNull();
  });
});
