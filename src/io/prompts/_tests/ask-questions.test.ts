import input from '@inquirer/input';
import search from '@inquirer/search';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Question, TextQuestion } from '../../../core/questions';

import { DEFAULT_COMMIT_TYPES } from '../../../core/commit-types';
import { getTranslations } from '../../../core/i18n';
import { askQuestions } from '../ask-questions';

vi.mock('@inquirer/input', () => ({ default: vi.fn() }));
vi.mock('@inquirer/search', () => ({ default: vi.fn() }));

const translations = getTranslations('en');
const [feat, fix] = DEFAULT_COMMIT_TYPES;

const QUESTIONS: Question[] = [
  { kind: 'type', key: 'type', message: 'Type?', commitTypes: [...DEFAULT_COMMIT_TYPES] },
  { kind: 'text', key: 'title', message: 'Title?', required: true, minLength: 0, maxLength: 70 },
  { kind: 'text', key: 'description', message: 'Body?', required: false, minLength: 0 }
];

const ask = (overrides: Partial<Parameters<typeof askQuestions>[0]> = {}) =>
  askQuestions({ questions: QUESTIONS, translations, ask: 'all', ...overrides });

describe('askQuestions', () => {
  beforeEach(() => {
    vi.mocked(search).mockResolvedValue(feat);
    vi.mocked(input).mockResolvedValue('  add login  ');
  });

  it('collects the answers with the emoji and code of the type', async () => {
    expect(await ask()).toEqual({
      type: 'feat',
      emoji: feat.emoji,
      code: feat.code,
      title: 'add login',
      description: 'add login'
    });
  });

  it('does not ask preset questions', async () => {
    const answers = await ask({ preset: { type: 'fix', title: 'x', description: '' } });

    expect(search).not.toHaveBeenCalled();
    expect(input).not.toHaveBeenCalled();
    expect(answers).toMatchObject({ type: 'fix', emoji: fix?.emoji, title: 'x', description: '' });
  });

  it('rejects an unknown preset type', async () => {
    await expect(ask({ preset: { type: 'nope' } })).rejects.toMatchObject({
      code: 'unknown-type',
      reason: 'Unknown commit type: nope'
    });
  });

  it('validates preset answers like typed ones', async () => {
    await expect(ask({ preset: { type: 'fix', title: 'a'.repeat(71) } })).rejects.toMatchObject({
      code: 'invalid',
      field: 'title',
      reason: 'Must be at most 70 characters'
    });
  });

  it('asks only the required questions in "required" mode', async () => {
    const answers = await ask({ preset: { type: 'fix' }, ask: 'required' });

    expect(input).toHaveBeenCalledOnce();
    expect(answers).toMatchObject({ title: 'add login', description: '' });
  });

  it('takes the type from the branch in "required" mode instead of asking', async () => {
    expect(await ask({ ask: 'required', defaults: { type: 'fix' }, preset: { title: 'x' } })).toMatchObject({
      type: 'fix'
    });
    expect(search).not.toHaveBeenCalled();
  });

  describe('in "none" mode', () => {
    it('fills optional answers with nothing', async () => {
      expect(await ask({ ask: 'none', preset: { type: 'fix', title: 'x' } })).toMatchObject({ description: '' });
      expect(input).not.toHaveBeenCalled();
    });

    it('throws an AnswerError naming the field of a missing required answer', async () => {
      await expect(ask({ ask: 'none', preset: { type: 'fix' } })).rejects.toMatchObject({
        name: 'AnswerError',
        code: 'missing',
        field: 'title'
      });
      await expect(ask({ ask: 'none' })).rejects.toMatchObject({ code: 'missing', field: 'type' });
    });
  });

  it('suggests the type and the issue from the branch', async () => {
    const questions: Question[] = [
      ...QUESTIONS,
      { kind: 'text', key: 'issues', message: 'Issues?', required: false, minLength: 0 }
    ];

    await askQuestions({ questions, translations, ask: 'all', defaults: { type: 'fix', issues: 'PROJ-1' } });

    expect(vi.mocked(search).mock.calls[0]?.[0]).toMatchObject({ default: fix });
    expect(vi.mocked(input).mock.calls.at(-1)?.[0]).toMatchObject({ default: 'PROJ-1' });
  });

  it('keeps preset answers for questions that are not asked, held to their limits', async () => {
    const extraQuestions: TextQuestion[] = [
      { kind: 'text', key: 'breaking', message: '', required: false, minLength: 0 },
      { kind: 'text', key: 'issues', message: '', required: false, minLength: 0, maxLength: 3 }
    ];
    const questions = QUESTIONS.slice(0, 2);

    expect(
      await ask({ questions, extraQuestions, preset: { type: 'fix', title: 'x', breaking: 'gone', issues: '7' } })
    ).toMatchObject({
      breaking: 'gone',
      issues: '7'
    });
    await expect(
      ask({ questions, extraQuestions, preset: { type: 'fix', title: 'x', issues: '1234' } })
    ).rejects.toMatchObject({
      field: 'issues'
    });
  });

  it('uses the length limit for the counter and the validation', async () => {
    await ask({ questions: QUESTIONS.slice(0, 2), limitLength: () => 5 });

    const [config] = vi.mocked(input).mock.calls[0] ?? [];

    expect(config?.validate?.('123456')).toBe('Must be at most 5 characters');
    expect(config?.transformer?.('abc  ', { isFinal: false })).toContain('3/5');
    expect(config?.transformer?.('abc', { isFinal: true })).toBe('abc');
  });

  it('asks a question with choices as a search', async () => {
    vi.mocked(search).mockResolvedValueOnce('api');

    const answers = await askQuestions({
      questions: [
        {
          kind: 'text',
          key: 'component',
          message: 'Scope?',
          required: false,
          minLength: 0,
          choices: { values: ['api'], allowCustom: true }
        }
      ],
      translations,
      ask: 'all'
    });

    expect(answers).toEqual({ component: 'api' });
    expect(input).not.toHaveBeenCalled();
  });
});
