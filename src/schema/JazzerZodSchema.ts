import type { ZodType } from 'zod';

import { z } from 'zod';

import type { CommitJazzerPrompterOptions } from '@/types/index';

import type { ZodBaseQuestionsOptions } from './QuestionZodSchema';
import type { ZodShowBannerOptions } from './ShowBannerZodSchema';

import BadWordsOptionsSchema from './BadWordsOptionsSchema';
import CommitTypesSchema from './CommitTypesZodSchema';
import AddCustomCommitTypesSchema from './CustomCommitTypesZodSchema';
import { ZCommitActionType, ZLanguage } from './modules/ZodEnums';
import { BaseQuestionsOptionsSchema } from './QuestionZodSchema';
import ShowBannerOptionsSchema from './ShowBannerZodSchema';

// Remove fields for override.
type OmitCommitJazzerPrompterOptions = Omit<
	CommitJazzerPrompterOptions,
	'availableCommitTypes' | 'availablePromptQuestions' | 'baseQuestionsOptions' | 'createCustomQuestions' | 'language' | 'showBannerOptions'
>;

// Define options with updated availableCommitTypes type.
type CommitJazzerZodOptions = OmitCommitJazzerPrompterOptions & {
	language?: string;
	availableCommitTypes?: string[];
	availablePromptQuestions?: string[];
	baseQuestionsOptions?: ZodBaseQuestionsOptions[];
	showBannerOptions?: ZodShowBannerOptions;
};

const CommitJazzerPrompterOptionsSchema: ZodType<CommitJazzerZodOptions> = z.object({
	language: ZLanguage.optional(),
	template: z.string().optional(),
	availableCommitTypes: z.array(ZCommitActionType).optional(),
	availablePromptQuestions: z.array(z.string()).optional(),
	baseCommitTypes: CommitTypesSchema.optional(),
	addCustomCommitTypes: AddCustomCommitTypesSchema.optional(),
	baseQuestionsOptions: z.array(BaseQuestionsOptionsSchema).optional(),
	validateCommitBadWords: z.boolean().optional(),
	badWordsOptions: BadWordsOptionsSchema.optional(),
	showBanner: z.boolean().optional(),
	showBannerOptions: ShowBannerOptionsSchema.optional(),
});

export default CommitJazzerPrompterOptionsSchema;
