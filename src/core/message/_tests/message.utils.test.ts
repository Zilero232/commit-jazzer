import { describe, expect, it } from 'vitest';

import { normalizeTitle, splitIssues, wrapLine } from '../message.utils';

describe('normalizeTitle', () => {
  it('lower-cases the first letter', () => {
    expect(normalizeTitle('Add retry flag')).toBe('add retry flag');
  });

  it('keeps acronyms as they are', () => {
    expect(normalizeTitle('API keys are optional')).toBe('API keys are optional');
  });

  it('drops a trailing period', () => {
    expect(normalizeTitle('fix typo...')).toBe('fix typo');
  });

  it('keeps a title that would end up empty', () => {
    expect(normalizeTitle('...')).toBe('...');
  });

  it('handles single letters and empty titles', () => {
    expect(normalizeTitle('X')).toBe('x');
    expect(normalizeTitle('')).toBe('');
  });
});

describe('splitIssues', () => {
  it('turns bare numbers into references', () => {
    expect(splitIssues('12 #13,14')).toEqual(['#12', '#13', '#14']);
  });

  it('keeps tracker keys and URLs', () => {
    expect(splitIssues('JIRA-1 https://x.dev/i/2')).toEqual(['JIRA-1', 'https://x.dev/i/2']);
  });

  it('drops footer keywords typed out of habit, with or without a colon', () => {
    expect(splitIssues('closes #12, Fixes 13, resolved JIRA-2')).toEqual(['#12', '#13', 'JIRA-2']);
    expect(splitIssues('Closes: #1 Fixes: 12')).toEqual(['#1', '#12']);
  });
});

describe('wrapLine', () => {
  it('leaves short lines alone', () => {
    expect(wrapLine({ line: 'short line', width: 20 })).toEqual(['short line']);
  });

  it('wraps at word boundaries within the width', () => {
    const lines = wrapLine({ line: 'one two three four five six', width: 10 });

    expect(lines).toEqual(['one two', 'three four', 'five six']);
    lines.forEach((line) => expect(line.length).toBeLessThanOrEqual(10));
  });

  it('keeps the indentation on every wrapped line', () => {
    expect(wrapLine({ line: '  - one two three four', width: 12 })).toEqual(['  - one two', '  three four']);
  });

  it('puts a word longer than the width on its own line', () => {
    expect(wrapLine({ line: 'see https://example.com/a/very/long/path now', width: 10 })).toEqual([
      'see',
      'https://example.com/a/very/long/path',
      'now'
    ]);
  });

  it('never starts a wrapped line with "#", which git would drop as a comment', () => {
    const lines = wrapLine({ line: 'the bug from #77 was the culprit', width: 14 });

    expect(lines.some((line) => line.startsWith('#'))).toBe(false);
    expect(lines.join(' ')).toBe('the bug from #77 was the culprit');
  });

  it('leaves footer lines whole', () => {
    const footer = 'BREAKING CHANGE: a very long explanation of what changed and why it matters';

    expect(wrapLine({ line: footer, width: 20 })).toEqual([footer]);
    expect(
      wrapLine({ line: 'Co-authored-by: Someone With A Long Name <someone@example.com>', width: 20 })
    ).toHaveLength(1);
  });

  it('measures by terminal columns', () => {
    expect(wrapLine({ line: '変更 内容 を 詳しく', width: 8 })).toEqual(['変更', '内容 を', '詳しく']);
  });

  it('does not wrap when the width is 0', () => {
    expect(wrapLine({ line: 'a b c', width: 0 })).toEqual(['a b c']);
  });

  describe('wrapLine and "#"', () => {
    it('moves a word down rather than making a line longer than the width', () => {
      const line = `${'word '.repeat(19)}ab #1234 more text here`;
      const lines = wrapLine({ line, width: 100 });

      lines.forEach((part) => {
        expect(part.length).toBeLessThanOrEqual(100);
        expect(part.startsWith('#')).toBe(false);
      });
      expect(lines.join(' ')).toBe(line.trim());
    });
  });
});
