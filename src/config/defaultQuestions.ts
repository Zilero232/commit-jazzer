import type {TranslationsJson} from '@/types/modules/language';
import type { BaseQuestion, PromptQuestionTypeValues } from '@/types/modules/prompt';

import { CommitFieldsEnum } from '@/types/modules/commit';
import { LanguageEnum  } from '@/types/modules/language';
import { PromptQuestionTypeEnum } from '@/types/modules/prompt';

import { translations } from '../translations';

// Define current translations.
const CURRENT_TRANSLATIONS: Partial<TranslationsJson> = translations[LanguageEnum.Russian];

interface DEFAULT_QUESTIONS_INTERFACE extends BaseQuestion {
	type: PromptQuestionTypeValues;
}

const DEFAULT_QUESTIONS: DEFAULT_QUESTIONS_INTERFACE[] = [
	{
		type: PromptQuestionTypeEnum.Autocomplete,
		key: CommitFieldsEnum.ActionType,
		message: CURRENT_TRANSLATIONS.type,
		options: {
			required: true,
		},
	},
	{
		type: PromptQuestionTypeEnum.MaxLengthInput,
		key: CommitFieldsEnum.Component,
		message: CURRENT_TRANSLATIONS.component,
	},
	{
		type: PromptQuestionTypeEnum.MaxLengthInput,
		key: CommitFieldsEnum.Title,
		message: CURRENT_TRANSLATIONS.title,
		options: {
			required: true,
		},
	},
	{
		type: PromptQuestionTypeEnum.MaxLengthInput,
		key: CommitFieldsEnum.Description,
		message: CURRENT_TRANSLATIONS.description,
	},
	{
		type: PromptQuestionTypeEnum.MaxLengthInput,
		key: CommitFieldsEnum.BreakingChanges,
		message: CURRENT_TRANSLATIONS.breaking,
	},
	{
		type: PromptQuestionTypeEnum.MaxLengthInput,
		key: CommitFieldsEnum.RelatedIssues,
		message: CURRENT_TRANSLATIONS.issues,
	},
	{
		type: PromptQuestionTypeEnum.MaxLengthInput,
		key: CommitFieldsEnum.Comment,
		message: CURRENT_TRANSLATIONS.comment,
	},
];

export default DEFAULT_QUESTIONS;
