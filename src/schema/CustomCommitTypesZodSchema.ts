import type { ZodType } from 'zod';

import { z } from 'zod';

import type { CommitJazzerPrompterOptions } from '../types';

const AddCustomCommitTypesSchema: ZodType<CommitJazzerPrompterOptions['addCustomCommitTypes']> = z
	.record(
		z.string(),
		z.object({
			emoji: z.string(),
			code: z.string(),
			description: z.string(),
		}),
	)
	.optional();

export default AddCustomCommitTypesSchema;
