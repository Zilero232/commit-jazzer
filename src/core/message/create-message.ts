import { mapValues } from 'remeda';

import type { CreateMessageInput, CreateMessageResult } from './message.types';

import { getTranslations, interpolate } from '../i18n';
import { createProfanityFilter } from '../profanity';
import { formatMessage } from './format-message';

/** Formats the answers and applies the profanity settings. */
export const createMessage = ({ config, answers, message: given }: CreateMessageInput): CreateMessageResult => {
  const message = given ?? formatMessage({ data: answers, config });

  if (!config.validateCommitBadWords) {
    return { status: 'ok', message };
  }

  const { checkHasProfaneWords, replaceProfaneWords, clearMessage, options } = config.badWordsOptions;
  const filter = createProfanityFilter(options);
  const found = filter.findProfaneWords(message);
  const reason = interpolate({
    text: getTranslations(config.language).messages.prohibitedWords,
    values: { words: found.join(', ') }
  });

  if (checkHasProfaneWords && found.length > 0) {
    return { status: 'blocked', profaneWords: found, reason };
  }

  // Removing wins over masking: a masked word would no longer be found to remove. The answers are cleaned
  // before formatting, so a removed scope leaves no `()` behind.
  if (clearMessage) {
    if (given !== undefined) {
      return { status: 'ok', message: filter.clean(given) };
    }

    const cleaned = mapValues(answers, (value) => value && filter.clean(value));

    if (!cleaned.title?.trim()) {
      return { status: 'blocked', profaneWords: filter.findProfaneWords(message), reason };
    }

    return { status: 'ok', message: formatMessage({ data: cleaned, config }) };
  }

  return { status: 'ok', message: replaceProfaneWords ? filter.mask(message) : message };
};
