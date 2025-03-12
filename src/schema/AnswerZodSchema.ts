import { z } from 'zod';

import type { PromptQuestionOptions, PromptQuestionTypeValues } from '@/types/modules/prompt';

import { PromptQuestionTypeEnum } from '@/types/modules/prompt';

/**
 * Creates a Zod schema for a given prompt question type and options.
 *
 * @param type Prompt question type.
 * @param options Prompt question options.
 *
 * @returns Zod schema for the given prompt question.
 */
const AnswerZodSchema = (type: PromptQuestionTypeValues, options: PromptQuestionOptions) => {
	let schema: z.ZodObject<any> | z.ZodString = z.string();

	const lengthOptions = options.validations?.length;

	switch (type) {
		case PromptQuestionTypeEnum.Autocomplete:
			schema = z.object({
				name: z.string().min(1, 'Name is required'),
				value: z.object({}).catchall(z.string().min(1, 'Value is required')),
			});

			break;
		case PromptQuestionTypeEnum.MaxLengthInput:
			if (lengthOptions) {
				// Apply the maximum length.
				if (lengthOptions.minMessageLength) {
					schema = schema.min(lengthOptions.minMessageLength);
				}

				// Apply the minimum length.
				if (lengthOptions.maxMessageLength) {
					schema = schema.max(lengthOptions.maxMessageLength);
				}
			}

			// Adding required.
			if (options.required) {
				schema = schema.min(1, 'Field cannot be empty');
			}

			break;
		default:
			throw new Error(`Unsupported question type: ${type}`);
	}

	return schema;
};

export default AnswerZodSchema;
