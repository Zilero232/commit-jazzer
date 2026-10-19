import { describe, expect, it } from 'vitest';

import type { JazzerConfig } from '../../config';

import { resolvedConfig } from '../../../shared/testing/helpers';
import { formatMessage } from '../../message';
import { lintMessage } from '../lint-message';

const lint = (message: string, config: JazzerConfig = {}) => lintMessage({ message, config: resolvedConfig(config) });
const rules = (message: string, config?: JazzerConfig) => lint(message, config).map(({ rule }) => rule);

describe('lintMessage', () => {
  it('accepts every message commit-jazzer writes', () => {
    const config = resolvedConfig();
    const message = formatMessage({
      data: {
        type: 'feat',
        emoji: '✨',
        component: 'api',
        title: 'add x',
        description: 'why',
        breaking: 'gone',
        issues: '1 2'
      },
      config
    });

    expect(lintMessage({ message, config })).toEqual([]);
  });

  it('rejects a first line that is not "type(scope): subject"', () => {
    expect(rules('added stuff')).toEqual(['header']);
    expect(rules('feat:missing space')).toEqual(['header']);
  });

  it('rejects an unknown type, naming the known ones', () => {
    const [issue] = lint('feature: ✨ x', { availableCommitTypes: ['feat', 'fix'] });

    expect(issue).toEqual({ rule: 'type', message: 'Unknown type "feature". Use one of: feat, fix' });
  });

  it('accepts custom types', () => {
    expect(
      rules('release: 🔖 v2', {
        addCustomCommitTypes: { release: { emoji: '🔖', code: ':bookmark:', description: 'x' } }
      })
    ).toEqual([]);
  });

  it('rejects a scope outside the list only when custom scopes are not allowed', () => {
    expect(rules('feat(web): x', { scopes: ['api'], allowCustomScopes: false })).toEqual(['scope']);
    expect(rules('feat(web): x', { scopes: ['api'] })).toEqual([]);
    expect(rules('feat: x', { scopes: ['api'], allowCustomScopes: false })).toEqual([]);
  });

  it('rejects an empty subject and a header over the limit', () => {
    expect(rules('feat: ')).toEqual(['subject']);
    expect(rules(`feat: ${'x'.repeat(20)}`, { headerMaxLength: 20 })).toEqual(['header-length']);
  });

  it('wants a blank line after the header', () => {
    expect(rules('feat: x\nbody')).toEqual(['body-blank-line']);
  });

  it('holds body lines to the width, but not footers or single long words', () => {
    const config = { bodyLineLength: 20 };

    expect(rules(`feat: x\n\n${'word '.repeat(6)}`, config)).toEqual(['body-length']);
    expect(rules('feat: x\n\nCloses #1, #2, #3, #4, #5, #6\nhttps://example.com/a/very/long/link', config)).toEqual([]);
  });

  it('ignores the comment lines git adds', () => {
    expect(rules('feat: x\n# Please enter the commit message\n# for your changes.')).toEqual([]);
  });

  it.each(['Merge branch "main"', 'Revert "feat: x"', 'fixup! feat: x', 'squash! feat: x'])(
    'lets "%s" pass',
    (message) => {
      expect(lint(message)).toEqual([]);
    }
  );

  it('ignores the diff git commit -v adds under the scissors line', () => {
    const diff = `${'+ long line '.repeat(20)}`;

    expect(
      rules(
        `feat: x\n\n# ------------------------ >8 ------------------------\n# Do not modify or remove the line above.\ndiff --git a/f b/f\n${diff}`
      )
    ).toEqual([]);
  });

  it('lints a header that starts with "#" instead of taking it for a comment', () => {
    expect(rules('#WIP hello')).toEqual(['header']);
  });

  it('follows core.commentChar', () => {
    expect(
      lintMessage({ message: `feat: x\n; ${'comment '.repeat(30)}`, config: resolvedConfig(), commentChar: ';' })
    ).toEqual([]);
  });

  it('rejects a type with "-", which Conventional Commits parsers cannot read', () => {
    expect(rules('fix-ci: x')).toEqual(['header']);
  });

  it('lets a reapplied revert pass', () => {
    expect(lint('Reapply "feat: x"')).toEqual([]);
  });
});
