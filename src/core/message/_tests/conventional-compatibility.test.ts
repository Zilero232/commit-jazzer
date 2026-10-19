import type { ParserOptions } from 'conventional-commits-parser';

import config from '@commitlint/config-conventional';
import lint from '@commitlint/lint';
import createPreset from 'conventional-changelog-conventionalcommits';
import { CommitParser } from 'conventional-commits-parser';
import { describe, expect, it } from 'vitest';

import { resolvedConfig } from '../../../shared/testing/helpers';
import { DEFAULT_COMMIT_TYPES } from '../../commit-types';
import { formatMessage } from '../format-message';

// The rules that judge the format itself. type-enum is off: commit-jazzer has more types than config-conventional.
const RULES = { ...config.rules, 'type-enum': [0, 'always', []] } as const;

// The preset commitlint's config-conventional and semantic-release's conventionalcommits preset both parse with.
const preset: { parser?: ParserOptions } = await createPreset();
const parserOpts = preset.parser;
const parser = new CommitParser(parserOpts);

const CASES = {
  'header only': { title: 'add login' },
  'with scope': { component: 'auth', title: 'add login' },
  'with body': { title: 'add login', description: 'why it was needed|and how' },
  'breaking change': { component: 'api', title: 'drop v1', breaking: 'v1 endpoints are gone' },
  'with issues': { title: 'fix crash', issues: '12, 13' },
  everything: {
    component: 'core',
    title: 'Rewrite config loading.',
    description: `${'long body text '.repeat(20)}|second paragraph`,
    comment: 'see the discussion',
    breaking: 'the loader is async now',
    issues: '1 2'
  }
};

describe('generated messages', () => {
  const settings = resolvedConfig();

  describe.each(Object.entries(CASES))('%s', (_, answers) => {
    describe.each(DEFAULT_COMMIT_TYPES)('$name', (type) => {
      const message = formatMessage({
        data: { ...answers, type: type.name, emoji: type.emoji, code: type.code },
        config: settings
      });

      it('passes @commitlint/config-conventional', async () => {
        const report = await lint(message, RULES, { parserOpts });

        expect(report.errors, message).toEqual([]);
      });

      it('parses with the type, scope and breaking note semantic-release expects', () => {
        const commit = parser.parse(message);

        expect(commit.type).toBe(type.name);
        expect(commit.scope ?? undefined).toBe('component' in answers ? answers.component : undefined);
        expect(commit.notes.some(({ title }) => title === 'BREAKING CHANGE')).toBe('breaking' in answers);
      });
    });
  });
});
