import { describe, expect, it } from 'vitest';

import { resolvedConfig } from '../../../shared/testing/helpers';
import { formatMessage, headerPrefixLength, renderTemplate } from '../format-message';

const FEAT = { type: 'feat', emoji: '✨', code: ':sparkles:' };

describe('formatMessage', () => {
  const config = resolvedConfig();

  it('writes a header-only message when only type and title are given', () => {
    expect(formatMessage({ data: { ...FEAT, title: 'add login' }, config })).toBe('feat: ✨ add login');
  });

  it('writes the full message: scope, bang, body and footers', () => {
    const message = formatMessage({
      data: {
        ...FEAT,
        component: 'auth',
        title: 'Add login.',
        description: 'first|second',
        comment: 'reviewed by QA',
        breaking: 'sessions are reset',
        issues: '12'
      },
      config
    });

    expect(message).toBe(
      [
        'feat(auth)!: ✨ add login',
        '',
        'first',
        'second',
        '',
        'reviewed by QA',
        '',
        'BREAKING CHANGE: sessions are reset',
        'Closes #12'
      ].join('\n')
    );
  });

  it('leaves no blank-line gaps when optional fields are empty', () => {
    const message = formatMessage({ data: { ...FEAT, title: 'x', description: '', issues: '7' }, config });

    expect(message).toBe('feat: ✨ x\n\nCloses #7');
  });

  it('wraps body lines but never the header', () => {
    const title = 'a'.repeat(120);
    const [header, , body] = formatMessage({
      data: { ...FEAT, title, description: 'word '.repeat(40) },
      config: resolvedConfig({ lowercaseTitle: false, bodyLineLength: 50 })
    }).split('\n');

    expect(header).toBe(`feat: ✨ ${title}`);
    expect(body?.length).toBeLessThanOrEqual(50);
  });

  it('does not HTML-escape the answers', () => {
    expect(formatMessage({ data: { ...FEAT, title: 'support <T> & "quotes"' }, config })).toBe(
      'feat: ✨ support <T> & "quotes"'
    );
  });

  it('uses a custom template with Handlebars blocks', () => {
    const custom = resolvedConfig({ template: '{{code}} {{type}}{{#if component}} [{{component}}]{{/if}}: {{title}}' });

    expect(formatMessage({ data: { ...FEAT, component: 'ui', title: 'x' }, config: custom })).toBe(
      ':sparkles: feat [ui]: x'
    );
  });

  it('keeps the title as typed when lowercaseTitle is off', () => {
    expect(
      formatMessage({ data: { ...FEAT, title: 'Add X.' }, config: resolvedConfig({ lowercaseTitle: false }) })
    ).toBe('feat: ✨ Add X.');
  });

  it('writes one footer line per issue, so GitHub closes every one', () => {
    expect(formatMessage({ data: { ...FEAT, title: 'x', issues: '1, 2 JIRA-3' }, config })).toBe(
      'feat: ✨ x\n\nCloses #1\nCloses #2\nCloses JIRA-3'
    );
  });

  it('does not wrap the footers', () => {
    const issues = Array.from({ length: 30 }, (_, index) => `${index + 100}`).join(' ');
    const lines = formatMessage({
      data: { ...FEAT, title: 'x', issues },
      config: resolvedConfig({ bodyLineLength: 20 })
    }).split('\n');

    expect(lines.filter((line) => line.startsWith('Closes #'))).toHaveLength(30);
  });

  it('uses the configured issue prefix', () => {
    expect(
      formatMessage({ data: { ...FEAT, title: 'x', issues: '1' }, config: resolvedConfig({ issuePrefix: 'Refs' }) })
    ).toBe('feat: ✨ x\n\nRefs #1');
  });

  // One space around "|" belongs to the separator; more is indentation.
  it('keeps the indentation of body lines', () => {
    const message = formatMessage({
      data: { ...FEAT, title: 'x', description: 'Steps: |   - first |   - second | ``` |   code() | ```' },
      config
    });

    expect(message).toBe('feat: ✨ x\n\nSteps:\n  - first\n  - second\n```\n  code()\n```');
  });

  it('keeps "|" when the break-line character is turned off', () => {
    const message = formatMessage({
      data: { ...FEAT, title: 'x', description: 'a | b' },
      config: resolvedConfig({ breaklineChar: '' })
    });

    expect(message).toBe('feat: ✨ x\n\na | b');
  });
});

describe('renderTemplate', () => {
  it('trims trailing spaces and collapses blank lines', () => {
    expect(renderTemplate({ template: '{{a}}  \n\n\n\n{{b}}\n', data: { a: 'x', b: 'y' } })).toBe('x\n\ny');
  });
});

describe('headerPrefixLength', () => {
  it('is the length of the header without the title', () => {
    const config = resolvedConfig();

    expect(headerPrefixLength({ data: { ...FEAT, component: 'api' }, config })).toBe('feat(api): ✨ '.length);
  });
});
