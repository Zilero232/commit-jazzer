import { isDefined } from 'remeda';

import type { CommitAnswers } from '../core/message';
import type { ResolvePresetInput } from './app.types';

import { templateFields } from '../core/message';
import { AnswerError } from '../core/questions';
import { COMMIT_FIELDS } from '../shared/constants';
import { MESSAGES } from '../shared/messages';

/**
 * The answers given up front: those of the alias, with the flags on top.
 *
 * @throws {Error} for an unknown alias; {AnswerError} for an answer the template would drop.
 */
export const resolvePreset = ({ config, flags, alias }: ResolvePresetInput): CommitAnswers => {
  // `Object.hasOwn`: `jazzer :constructor` must not find Object.prototype.constructor.
  if (isDefined(alias) && !Object.hasOwn(config.aliases, alias)) {
    const known = Object.keys(config.aliases).map((name) => `:${name}`);

    throw new Error(MESSAGES.answer.unknownAlias({ alias, known }));
  }

  const preset = { ...(isDefined(alias) ? config.aliases[alias] : {}), ...flags };
  const written = templateFields(config.template);
  // An answer the template never writes would be lost without a word: a breaking change, say.
  const lost = COMMIT_FIELDS.find((field) => preset[field] && !written.has(field));

  if (lost) {
    throw new AnswerError({
      code: 'invalid',
      field: lost,
      reason: MESSAGES.answer.lost(lost === 'component' ? 'scope' : lost)
    });
  }

  return preset;
};
