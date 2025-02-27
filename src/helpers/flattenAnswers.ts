import type { PromptAnswers } from '@/types/modules/prompt';

import { isObject } from './typeGuards';

/**
 * Flattens the given `PromptAnswers` object into a single-level object.
 *
 * @param answers - The `PromptAnswers` object to flatten, which may contain nested objects.
 *
 * @returns A flattened object where all nested properties are merged into the top-level object.
 *          If `answers` is not an object or is undefined/null, returns an empty object.
 */
const flattenAnswers = (answers: PromptAnswers): Record<string, unknown> => {
	let flatAnswers: Record<string, unknown> = {};

	if (!answers || !isObject(answers)) {
		return flatAnswers;
	}

	(Object.keys(answers) as (keyof PromptAnswers)[]).forEach(key => {
		const value = answers[key] ?? '';

		if (!value) {
			return;
		}

		if (isObject(value)) {
			// If it is an object, combine its fields with the main object.
			flatAnswers = { ...flatAnswers, ...(value as Record<string, unknown>) };
		} else {
			// If it is not an object, add it to the main object.
			flatAnswers[key] = value;
		}
	});

	return flatAnswers;
};

export default flattenAnswers;
