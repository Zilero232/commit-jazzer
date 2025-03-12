import type Inquirer from 'inquirer';

import type { BaseCommitType, CommitActionNames, CommitActionsEnum } from './modules/actions';
import type { BadWordsOptions } from './modules/badWords';
import type { ShowBannerOptions } from './modules/banner';
import type { CommitFieldsValues } from './modules/commit';
import type { LanguageValues } from './modules/language';
import type { BaseQuestion } from './modules/prompt';

// Define Inquirer types.
export type TypeInquirer = typeof Inquirer;

// Define commit function type.
export type CommitMessageFunc = (commitMessage: string) => void;

// Define commit jazzer prompter commitizen options.
export interface CommitJazzerPrompterOptions {
	/**
	 * Create custom commit types.
	 *
	 * @default {}
	 */
	addCustomCommitTypes?: Record<string, BaseCommitType>;

	/**
	 * The types that will be shown in the list of type selections.
	 *
	 * @default []
	 */
	availableCommitTypes?: (string | CommitActionNames)[];

	/**
	 * The types that will be shown in the list of type selections.
	 *
	 * @default []
	 */
	availablePromptQuestions?: CommitFieldsValues[];

	/**
	 * Bad words validation options.
	 *
	 * @default {}
	 */
	badWordsOptions?: BadWordsOptions;

	/**
	 * Can change the basic types here.
	 *
	 * @default {}
	 */
	baseCommitTypes?: Partial<Record<CommitActionsEnum, Partial<BaseCommitType>>>;

	/**
	 * Change options of the basic questions.
	 *
	 * @default []
	 */
	baseQuestionsOptions?: BaseQuestion[];

	/**
	 * Language.
	 *
	 * @default "en"
	 */
	language?: LanguageValues;

	/**
	 * Show the banner before starting the commit process.
	 *
	 * @default true
	 */
	showBanner?: boolean;

	/**
	 * Show the banner before starting the commit process.
	 *
	 * @default {}
	 */
	showBannerOptions?: ShowBannerOptions;

	/**
	 * Format message.
	 *
	 * @default "{{type}}: {{emoji}} - {{title}}";
	 */
	template?: string;

	/**
	 * Check commit message for bad words
	 *
	 * @default true
	 */
	validateCommitBadWords?: boolean;
}
