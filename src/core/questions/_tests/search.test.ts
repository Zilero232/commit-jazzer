import { describe, expect, it } from 'vitest';

import { DEFAULT_COMMIT_TYPES } from '../../commit-types';
import { createChoiceSearch } from '../search-choices';
import { createCommitTypeSearch } from '../search-commit-types';

describe('createCommitTypeSearch', () => {
  const search = createCommitTypeSearch([...DEFAULT_COMMIT_TYPES]);
  const names = (term: string) => search(term).map(({ value }) => value.name);

  it('lists every type for an empty term', () => {
    expect(search()).toHaveLength(DEFAULT_COMMIT_TYPES.length);
    expect(search('  ')).toHaveLength(DEFAULT_COMMIT_TYPES.length);
  });

  it('puts names starting with the term first, in list order', () => {
    expect(names('f').slice(0, 3)).toEqual(['feat', 'fix', 'flag']);
    expect(names('FI')[0]).toBe('fix');
  });

  it('finds a type by its description and emoji code', () => {
    expect(names('documentation')).toContain('docs');
    expect(names(':bug:')[0]).toBe('fix');
    expect(names('bug')[0]).toBe('fix');
  });

  it('lists each type once', () => {
    expect(new Set(names('fix')).size).toBe(names('fix').length);
  });

  it('shows the emoji, the padded name and the description', () => {
    const [feat] = search('feat');

    expect(feat?.name).toMatch(/^✨ {2}feat\s+Introducing new features$/);
    expect(feat?.short).toBe('✨ feat');
  });
});

describe('createChoiceSearch', () => {
  const labels = { none: '(none)', custom: (value: string) => `use ${value}` };
  const search = createChoiceSearch({
    choices: { values: ['api', 'cli', 'web-app'], allowCustom: true },
    required: false,
    labels
  });

  it('lists every value and "none" for an empty term', () => {
    expect(search().map(({ value }) => value)).toEqual(['api', 'cli', 'web-app', '']);
  });

  it('filters case-insensitively and offers the typed text as a custom value', () => {
    expect(search('AP')).toEqual([
      { name: 'api', value: 'api' },
      { name: 'web-app', value: 'web-app' },
      { name: 'use AP', value: 'AP' },
      { name: '(none)', value: '' }
    ]);
  });

  it('does not offer a custom value equal to a listed one', () => {
    expect(search('cli').filter(({ value }) => value === 'cli')).toHaveLength(1);
  });

  it('offers neither custom values nor "none" when they are not allowed', () => {
    const strict = createChoiceSearch({ choices: { values: ['api'], allowCustom: false }, required: true, labels });

    expect(strict('zzz')).toEqual([]);
  });
});
