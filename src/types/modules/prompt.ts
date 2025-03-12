import type { CommitFieldsValues } from './commit';

// Define prompt question types.
export enum PromptQuestionTypeEnum {
	Autocomplete = 'autocomplete',
	MaxLengthInput = 'maxlength-input',
}

// Define prompt question type values.
export type PromptQuestionTypeValues = `${PromptQuestionTypeEnum}`;

// Define prompt question options.
export interface PromptQuestionOptions {
	/**
	 * Required question.
	 *
	 * @default boolean
	 */
	required?: boolean;

	/**
	 * Skip question.
	 *
	 * @default boolean
	 */
	skip?: boolean;

	/**
	 * Validation options.
	 *
	 * @default {}
	 */
	validations?: {
		length?: {
			/**
			 * Minimum message length.
			 *
			 * @default 0
			 */
			minMessageLength?: number;

			/**
			 * Maximum message length.
			 *
			 * @default 70
			 */
			maxMessageLength?: number;
		};
	};
}

// Define base interface question.
interface BaseInterfaceQuestion {
	/**
	 * Question message.
	 *
	 * @default "For example message"
	 */
	message?: string;

	/**
	 * Question options.
	 *
	 * @default {}
	 */
	options?: PromptQuestionOptions;
}

// Define base question.
export interface BaseQuestion extends BaseInterfaceQuestion {
	/**
	 * Question key.
	 *
	 * @default "type"
	 */
	key: CommitFieldsValues;
}

// Define prompt questions.
export interface PromptQuestions extends BaseInterfaceQuestion {
	/**
	 * Question key.
	 *
	 * @default "random"
	 */
	key: string | CommitFieldsValues;

	/**
	 * Question type.
	 *
	 * @default "input"
	 */
	type: string | PromptQuestionTypeValues;
}

// Исключаем ActionType из CommitFieldsEnum
type CommitFieldsWithoutActionType = 'emoji' | CommitFieldsValues;

// Define prompt answers type.
export type PromptAnswers = {
	readonly [key in CommitFieldsWithoutActionType]?: string;
};
