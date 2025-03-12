import type { ZodType } from 'zod';

import { z } from 'zod';

import type { BadWordsOptions } from '@/types/modules/badWords';

const BadWordsOptionsSchema: ZodType<BadWordsOptions> = z.object({
	checkHasProfaneWords: z.boolean().optional(),
	clearMessage: z.boolean().optional(),
	replaceProfaneWords: z.boolean().optional(),
	options: z
		.object({
			additionalBlockWords: z.array(z.string()).optional(),
			excludedWords: z.array(z.string()).optional(),
			overrideBlockWords: z.boolean().optional(),
		})
		.optional(),
});

export default BadWordsOptionsSchema;
