import type { CommitAnswers } from '../core/message';
import type { ResolvePresetInput } from './app.types';

import { templateFields } from '../core/message';
import { AnswerError } from '../core/questions';
import { COMMIT_FIELDS } from '../shared/constants';

/**
 * The answers given up front: those of the alias, with the flags on top.
 *
 * @throws {Error} for an unknown alias; {AnswerError} for an answer the template would drop.
 */
export const resolvePreset = ({ config, flags, alias }: ResolvePresetInput): CommitAnswers => {
  // `Object.hasOwn`: `jazzer :constructor` must not find Object.prototype.constructor.
  if (alias !== undefined && !Object.hasOwn(config.aliases, alias)) {
    const known = Object.keys(config.aliases).map((name) => `:${name}`);

    throw new Error(
      `Unknown alias ":${alias}". ${known.length > 0 ? `Known: ${known.join(', ')}` : 'The config has no aliases.'}`
    );
  }

  const preset = { ...(alias === undefined ? {} : config.aliases[alias]), ...flags };
  const written = templateFields(config.template);
  // An answer the template never writes would be lost without a word: a breaking change, say.
  const lost = COMMIT_FIELDS.find((field) => preset[field] && !written.has(field));

  if (lost) {
    throw new AnswerError({
      code: 'invalid',
      field: lost,
      reason: `the template has no {{${lost === 'component' ? 'scope' : lost}}}, so this answer would be lost`
    });
  }

  return preset;
};
