import { describe, expect, it } from 'vitest';

import type { JazzerConfig } from '../../config';
import type { TextQuestion } from '../questions.types';

import { resolvedConfig } from '../../../shared/testing/helpers';
import { getTranslations } from '../../i18n';
import { buildQuestions } from '../build-questions';
import { createLengthLimit } from '../length-limit';

const title: TextQuestion = { kind: 'text', key: 'title', message: '', required: true, minLength: 0, maxLength: 200 };
const answers = { type: 'feat', emoji: '✨', component: 'api' };
const PREFIX = 'feat(api): ✨ '.length;

const limitFor = (settings: JazzerConfig) => {
  const config = resolvedConfig(settings);

  return createLengthLimit({ config, questions: buildQuestions({ config, translations: getTranslations('en') }) });
};

describe('createLengthLimit', () => {
  it('gives the title what is left of the header', () => {
    const limit = limitFor({ availablePromptQuestions: ['type', 'component', 'title'] });

    expect(limit({ question: title, answers })).toBe(100 - PREFIX);
  });

  it('keeps room for "!" while the breaking-change question is ahead', () => {
    expect(limitFor({})({ question: title, answers })).toBe(100 - PREFIX - 1);
  });

  it('keeps no room for "!" when the breaking-change question is skipped', () => {
    const limit = limitFor({ baseQuestionsOptions: [{ key: 'breaking', options: { skip: true } }] });

    expect(limit({ question: title, answers })).toBe(100 - PREFIX);
  });

  it('never exceeds the limit of the question itself', () => {
    expect(limitFor({})({ question: { ...title, maxLength: 20 }, answers })).toBe(20);
  });

  it('leaves other questions alone', () => {
    expect(limitFor({})({ question: { ...title, key: 'description', maxLength: undefined }, answers })).toBeUndefined();
  });
});
