import BadWordFilter from 'pure-flow-ai';

import type { BadWordsOptions } from '@/types/modules/badWords';

import LOG_MESSAGES from '@/constants/logMessages';

interface FilterBadWordsProps {
	configuration: BadWordsOptions;
	message: string;
}

/**
 * Checks a given message for prohibited words and takes action depending on the configuration.
 *
 * @param {FilterBadWordsProps} props - The input properties.
 * @param {string} props.message - The message to be checked.
 * @param {BadWordsOptions} props.configuration - The configuration for the bad words filter.
 * @param {boolean} props.configuration.checkHasProfaneWords - Set to true to check for prohibited words.
 * @param {boolean} props.configuration.replaceProfaneWords - Set to true to replace prohibited words with a placeholder.
 * @param {boolean} props.configuration.clearMessage - Set to true to remove all prohibited words from the message.
 * @param {BadWordFilterOptions} props.configuration.options - Options for the bad words filter plugin.
 *
 * @returns {string | boolean} - The processed message or false if a prohibited word is found.
 */
export const filterBadWords = ({ message = '', configuration = {} }: FilterBadWordsProps): boolean | string => {
	const { clearMessage, checkHasProfaneWords, replaceProfaneWords, options = {} } = configuration;

	const { hasProfaneWords, maskProfanity, cleanString } = BadWordFilter(options);

	// Checking for prohibited words.
	if (checkHasProfaneWords) {
		const foundBadWords = hasProfaneWords(message);

		if (foundBadWords.length > 0) {
			LOG_MESSAGES.PROHIBITED_WORDS_ERROR(foundBadWords);

			// Return false if forbidden words are found.
			return false;
		}
	}

	// Replacing forbidden words with disguises.
	if (replaceProfaneWords) {
		message = maskProfanity(message);
	}

	// Clearing the message of forbidden words
	if (clearMessage) {
		message = cleanString(message);
	}

	return message;
};
