import type { ZodType } from 'zod';

import { z } from 'zod';

import type { BaseQuestion, PromptQuestionOptions } from '@/types/modules/prompt';

import { ZCommitFields } from './modules/ZodEnums';

// Define prompt question type for base questions.
export interface ZodBaseQuestionsOptions extends Omit<BaseQuestion, 'key'> {
	key: string;
}

const QuestionOptionsSchema: ZodType<PromptQuestionOptions> = z.object({
	required: z.boolean().optional(),
	skip: z.boolean().optional(),
	validations: z
		.object({
			length: z
				.object({
					minMessageLength: z.number().optional(),
					maxMessageLength: z.number().optional(),
				})
				.optional(),
		})
		.optional(),
});

// Schema for base prompt questions.
export const BaseQuestionsOptionsSchema: ZodType<ZodBaseQuestionsOptions> = z.object({
	key: ZCommitFields,
	message: z.string().optional(),
	options: QuestionOptionsSchema.optional(),
});
