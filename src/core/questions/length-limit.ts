import type { LengthLimitInput, LimitLengthInput } from './questions.types';

import { headerPrefixLength } from '../message';

/**
 * Keeps the header within `headerMaxLength`: the title gets what the type, scope and emoji leave,
 * minus one for the `!` when a breaking-change question is still ahead.
 */
export const createLengthLimit = ({ config, questions }: LengthLimitInput) => {
  const asksBreaking = questions.some(({ key }) => key === 'breaking');

  return ({ question, answers }: LimitLengthInput): number | undefined => {
    if (question.key !== 'title') {
      return question.maxLength;
    }

    const bang = asksBreaking && answers.breaking === undefined ? 1 : 0;
    const budget = config.headerMaxLength - headerPrefixLength({ data: answers, config }) - bang;

    return Math.max(1, Math.min(question.maxLength ?? budget, budget));
  };
};
