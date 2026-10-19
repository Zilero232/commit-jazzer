import { describe, expect, it } from 'vitest';

import type { TextQuestion } from '../questions.types';

import { getTranslations } from '../../i18n';
import { validateAnswer } from '../validate-answer';

const { validation, messages: ui } = getTranslations('en');
const messages = { ...validation, prohibitedWords: ui.prohibitedWords };

const question: TextQuestion = {
  kind: 'text',
  key: 'title',
  message: 'Title',
  required: true,
  minLength: 3,
  maxLength: 10
};

describe('validateAnswer', () => {
  it('accepts an answer within the limits', () => {
    expect(validateAnswer({ value: 'add login', question, messages })).toBe(true);
  });

  it('rejects an empty required answer, ignoring spaces', () => {
    expect(validateAnswer({ value: '   ', question, messages })).toBe(validation.required);
  });

  it('accepts an empty optional answer even with a minimum length', () => {
    expect(validateAnswer({ value: '', question: { ...question, required: false }, messages })).toBe(true);
  });

  it('reports the minimum and maximum length', () => {
    expect(validateAnswer({ value: 'ab', question, messages })).toBe('Must be at least 3 characters');
    expect(validateAnswer({ value: 'a'.repeat(11), question, messages })).toBe('Must be at most 10 characters');
  });

  it('prefers the given maximum over the question one', () => {
    expect(validateAnswer({ value: 'abcdef', question, messages, maxLength: 5 })).toBe('Must be at most 5 characters');
  });

  it('accepts only listed values when custom ones are not allowed', () => {
    const scope: TextQuestion = {
      ...question,
      key: 'component',
      choices: { values: ['api', 'web'], allowCustom: false }
    };

    expect(validateAnswer({ value: 'api', question: scope, messages })).toBe(true);
    expect(validateAnswer({ value: 'nope', question: scope, messages })).toBe('Pick one of: api, web');
    expect(
      validateAnswer({
        value: 'nope',
        question: { ...scope, choices: { values: ['api'], allowCustom: true } },
        messages
      })
    ).toBe(true);
  });

  it('keeps header and footer answers on one line', () => {
    expect(validateAnswer({ value: 'one\ntwo', question, messages })).toBe('Must fit on one line');
    expect(
      validateAnswer({ value: 'one\ntwo', question: { ...question, key: 'description', maxLength: 100 }, messages })
    ).toBe(true);
  });

  it('keeps parentheses out of the scope', () => {
    expect(validateAnswer({ value: 'a(b)', question: { ...question, key: 'component' }, messages })).toBe(
      'Must not contain "(" or ")"'
    );
  });

  it('reports prohibited words', () => {
    const result = validateAnswer({ value: 'bad code', question, messages, findProfaneWords: () => ['bad'] });

    expect(result).toBe('The message contains prohibited words: bad. Please remove them.');
  });
});
