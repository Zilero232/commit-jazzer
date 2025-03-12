import type { CommitJazzerPrompterOptions } from '@/types/index';
import type { BaseQuestion, PromptQuestions, PromptQuestionTypeValues } from '@/types/modules/prompt';

import DEFAULT_QUESTIONS from '@/config/defaultQuestions';
import LOG_MESSAGES from '@/constants/logMessages';
import filterCommitTypes from '@/helpers/filterCommitTypes';
import generateErrorReport from '@/helpers/generateErrorReport';
import { isObject } from '@/helpers/typeGuards';
import AnswerZodSchema from '@/schema/AnswerZodSchema';
import { translations } from '@/translations';
import { CommitFieldsEnum } from '@/types/modules/commit';
import { PromptQuestionTypeEnum } from '@/types/modules/prompt';
import { createAutocompleteSource } from '@/utils';

/**
 * Generate questions for the commit prompter based on the given options.
 *
 * @param {CommitJazzerPrompterOptions} options - Options for generating the questions.
 * @param {string} options.language - The language to use for the translations.
 * @param {BaseQuestion[]} options.baseQuestionsOptions - Override options for the default questions.
 * @param {string[]} options.availableCommitTypes - The available commit types to use for the action type question.
 * @param {string[]} options.availablePromptQuestions - The available questions to include in the prompter.
 *
 * @returns {Promise<PromptQuestions[]>} - The generated questions.
 */
export const generateQuestionPrompts = async ({
	language,
	baseQuestionsOptions,
	availableCommitTypes = [],
	availablePromptQuestions = [],
	baseCommitTypes = {},
	addCustomCommitTypes = {},
}: CommitJazzerPrompterOptions) => {
	const promptQuestions: PromptQuestions[] = [];

	// If language is set, update the default questions.
	const CURRENT_TRANSLATIONS = language ? translations[language] : [];

	// Generate default questions.
	DEFAULT_QUESTIONS.forEach(question => {
		const { key } = question;

		// If the array is not empty and does not contain a key, skip this question.
		if (availablePromptQuestions.length > 0 && !availablePromptQuestions.includes(key)) {
			return;
		}

		let questionOptions = {
			...question,
		};

		// If there are override options for the question, apply them.
		if (baseQuestionsOptions) {
			const overrideOptions = baseQuestionsOptions.find((option: BaseQuestion) => option.key === key);

			if (overrideOptions) {
				questionOptions = {
					...questionOptions,
					...overrideOptions,
				};
			}
		}

		// If there is a override translation for the question, apply it.
		if (!questionOptions.message && isObject(CURRENT_TRANSLATIONS) && key in CURRENT_TRANSLATIONS) {
			questionOptions.message = CURRENT_TRANSLATIONS[key];
		}

		// Add the question to the promptQuestions array.
		promptQuestions.push(questionOptions);
	});

	const questions = promptQuestions.map(({ type, key, message, options = {} }) => {
		const { skip = false, validations = {} } = options;

		// Creating a Zod scheme based on the passed options.
		const schema = AnswerZodSchema(type as PromptQuestionTypeValues, options);

		const promptQuestion: Record<string, unknown> = {
			type,
			name: key,
			when: !skip,
			message,
			validate: async (input: string): Promise<boolean> => {
				// Checking the Zod scheme.
				const parseResult = await schema.safeParseAsync(input);

				if (!parseResult.success) {
					const errorMessage = generateErrorReport({
						issues: parseResult.error.issues,
					});

					LOG_MESSAGES.ERROR(errorMessage);
				}

				return parseResult.success;
			},
		};

		// If this is type = autocomplete, then add the source function for the search.
		if (type === PromptQuestionTypeEnum.Autocomplete) {
			switch (key) {
				case CommitFieldsEnum.ActionType:
					promptQuestion.source = createAutocompleteSource({
						data: filterCommitTypes({ availableCommitTypes, baseCommitTypes, addCustomCommitTypes }),
						formatOptions: {
							templateShowFormat: '{{name}} - {{description}} {{emoji}}',
							templateValueFormat: {
								type: 'name',
								emoji: 'emoji',
							},
						},
						fuseOptions: {
							keys: ['name', 'code', 'description'],
						},
					});

					break;
				default:
					LOG_MESSAGES.ERROR(`Unknown key: ${key}`);
			}
		}
		// If this is type = maxlength-input, then add the min and max length options.
		else if (type === PromptQuestionTypeEnum.MaxLengthInput) {
			promptQuestion.minLength = validations?.length?.minMessageLength || 0;
			promptQuestion.maxLength = validations?.length?.maxMessageLength || 70;
		}

		return promptQuestion;
	});

	return questions;
};
