import { describe, expect, it } from 'vitest';

import { createProfanityFilter } from '../create-profanity-filter';
import { BAD_WORDS } from '../profanity.constants';

describe('createProfanityFilter', () => {
  const filter = createProfanityFilter({ additionalBlockWords: ['badword', 'evil'], overrideBlockWords: true });

  it('finds blocked words regardless of case, each once', () => {
    expect(filter.findProfaneWords('This is a BadWord and evil, EVIL')).toEqual(['badword', 'evil']);
  });

  it('matches whole words only', () => {
    expect(filter.findProfaneWords('devilish badwords')).toEqual([]);
  });

  it('finds nothing in an empty string', () => {
    expect(filter.findProfaneWords('')).toEqual([]);
  });

  it('matches whole words in non-Latin scripts', () => {
    const russian = createProfanityFilter({ additionalBlockWords: ['плохо'], overrideBlockWords: true });

    expect(russian.findProfaneWords('Это плохо')).toEqual(['плохо']);
    expect(russian.findProfaneWords('неплохо')).toEqual([]);
  });

  it('treats regular expression characters literally', () => {
    const special = createProfanityFilter({ additionalBlockWords: ['c++'], overrideBlockWords: true });

    expect(special.findProfaneWords('I write c++ daily')).toEqual(['c++']);
    expect(special.findProfaneWords('I write c daily')).toEqual([]);
  });

  it('masks every character of a blocked word with the placeholder', () => {
    const hash = createProfanityFilter({
      additionalBlockWords: ['badword'],
      placeholder: '#',
      overrideBlockWords: true
    });

    expect(hash.mask('a badword! Badword?')).toBe('a #######! #######?');
  });

  it('removes blocked words together with one space', () => {
    expect(filter.clean('fix the evil bug')).toBe('fix the bug');
    expect(filter.clean('evil bug')).toBe('bug');
    expect(filter.clean('a bug, evil')).toBe('a bug,');
  });

  it('removes words next to punctuation and repeated words', () => {
    expect(filter.clean('(evil) ok')).toBe('() ok');
    expect(filter.clean('foo,evil bar')).toBe('foo,bar');
    expect(filter.clean('evil evil')).toBe('');
  });

  it('leaves the rest of the spacing alone', () => {
    expect(filter.clean('list:\n    - evil item\n    - good  item')).toBe('list:\n    - item\n    - good  item');
  });

  it('keeps the built-in list unless it is overridden', () => {
    const merged = createProfanityFilter({ additionalBlockWords: ['custom'] });

    expect(merged.blockList).toContain('custom');
    expect(merged.blockList).toHaveLength(BAD_WORDS.length + 1);
  });

  it('never blocks excluded words, whatever their case', () => {
    const relaxed = createProfanityFilter({ excludedWords: ['WTF'] });

    expect(relaxed.blockList).not.toContain('wtf');
    expect(relaxed.findProfaneWords('wtf')).toEqual([]);
  });
});
