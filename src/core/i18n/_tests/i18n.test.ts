import { describe, expect, it } from 'vitest';

import { LANGUAGES } from '../../../shared/constants';
import { getTranslations, interpolate } from '../i18n';

type Tree = { [key: string]: string | Tree };

const flatten = (tree: Tree, prefix = ''): [string, string][] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string' ? [[`${prefix}${key}`, value]] : flatten(value, `${prefix}${key}.`)
  );

const placeholders = (text: string) => (text.match(/\{\{\w+\}\}/g) ?? []).sort();

describe('getTranslations', () => {
  const reference = new Map(flatten(getTranslations('en')));

  describe.each(LANGUAGES)('%s', (language) => {
    const entries = flatten(getTranslations(language));

    it('has exactly the keys of en', () => {
      expect(entries.map(([key]) => key).sort()).toEqual([...reference.keys()].sort());
    });

    it('keeps every placeholder of en', () => {
      entries.forEach(([key, text]) => {
        expect(placeholders(text), key).toEqual(placeholders(reference.get(key) ?? ''));
      });
    });

    it('has no empty texts', () => {
      entries.forEach(([key, text]) => expect(text.trim(), key).not.toBe(''));
    });
  });
});

describe('interpolate', () => {
  it('replaces placeholders', () => {
    expect(interpolate({ text: 'At most {{max}} characters', values: { max: 70 } })).toBe('At most 70 characters');
  });

  it('does not escape values', () => {
    expect(interpolate({ text: 'use "{{value}}"', values: { value: 'a&b' } })).toBe('use "a&b"');
  });
});
