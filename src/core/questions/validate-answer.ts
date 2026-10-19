import type { ValidateAnswerInput } from './questions.types';

import { interpolate } from '../i18n';
import { MULTI_LINE_FIELDS } from './questions.constants';

/** Returns `true` for a valid answer, otherwise the error to show under the prompt. */
export const validateAnswer = ({
  value,
  question,
  messages,
  maxLength = question.maxLength,
  findProfaneWords
}: ValidateAnswerInput): string | true => {
  const answer = value.trim();
  // UTF-16 length, the way commitlint counts.
  const { length } = answer;

  if (!answer) {
    return question.required ? messages.required : true;
  }

  // Everything but the body goes into the header or a footer line.
  if (!MULTI_LINE_FIELDS.has(question.key) && /[\r\n]/.test(answer)) {
    return messages.singleLine;
  }

  // `feat(a(b)): …` is no longer a header any parser reads.
  if (question.key === 'component' && /[()]/.test(answer)) {
    return messages.noParentheses;
  }

  if (question.choices && !question.choices.allowCustom && !question.choices.values.includes(answer)) {
    return interpolate({ text: messages.notInList, values: { values: question.choices.values.join(', ') } });
  }

  if (length < question.minLength) {
    return interpolate({ text: messages.minLength, values: { min: question.minLength } });
  }

  if (maxLength !== undefined && length > maxLength) {
    return interpolate({ text: messages.maxLength, values: { max: maxLength } });
  }

  const profaneWords = findProfaneWords?.(answer) ?? [];

  if (profaneWords.length > 0) {
    return interpolate({ text: messages.prohibitedWords, values: { words: profaneWords.join(', ') } });
  }

  return true;
};
