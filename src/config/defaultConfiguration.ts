import type { CommitJazzerPrompterOptions } from '@/types/index.ts';

import { CommitFieldsEnum } from '@/types/modules/commit';
import { LanguageEnum } from '@/types/modules/language';

import DEFAULT_CONFIG_BANNER from './defaultConfigBanner';

// Define base template format.
const BASE_TEMPLATE_FORMAT = `{{${CommitFieldsEnum.ActionType}}}: {{emoji}} - {{${CommitFieldsEnum.Title}}}`;

// Define default configuration.
const DEFAULT_CONFIGURATION: CommitJazzerPrompterOptions = {
	language: LanguageEnum.English,
	availablePromptQuestions: ['type', 'title'],
	template: BASE_TEMPLATE_FORMAT,
	validateCommitBadWords: true,
	badWordsOptions: {
		checkHasProfaneWords: true,
		replaceProfaneWords: false,
		clearMessage: false,
	},
	showBanner: true,
	showBannerOptions: DEFAULT_CONFIG_BANNER,
};

export default DEFAULT_CONFIGURATION;
