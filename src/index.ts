import inquirerPrompt from 'inquirer-autocomplete-prompt';
import InquirerMaxLength from 'inquirer-maxlength-input-prompt';

import type { CommitMessageFunc, TypeInquirer } from './types';
import type {PromptAnswers} from './types/modules/prompt';

import flattenAnswers from './helpers/flattenAnswers';
import { isBoolean } from './helpers/typeGuards';
import showBanner from './scripts/showCommitBanner';
import {  PromptQuestionTypeEnum } from './types/modules/prompt';
import { filterBadWords, generateQuestionPrompts, loadJazzerConfig, messageFormatter } from './utils';

/**
 * Commitizen adapter for formatting commit messages with style and rhythm.
 *
 * @param {registerPrompt} inquirer - Inquirer instance.
 * @param {CommitMessageFunc} commitMessage - Commit message function.
 *
 * @returns {Promise<void>} - Promise that resolves when the commit message is formatted and committed.
 */
const CommitJazzerPrompter = async ({ registerPrompt, prompt }: TypeInquirer, commitMessage: CommitMessageFunc) => {
	registerPrompt(PromptQuestionTypeEnum.Autocomplete, inquirerPrompt);
	registerPrompt(PromptQuestionTypeEnum.MaxLengthInput, InquirerMaxLength);

	// Load the configuration.
	const configuration = await loadJazzerConfig();

	// Show the banner before starting the commit process.
	if (configuration?.showBanner) {
		await showBanner(configuration?.showBannerOptions);
	}

	// Get the questions.
	const questions = await generateQuestionPrompts(configuration);

	// Get the answers.
	const answers = await prompt<PromptAnswers>(questions);

	// Get the formatted message.
	let message = messageFormatter({
		template: configuration?.template ?? '',
		data: flattenAnswers(answers),
		options: {
			removeEmptyFields: true,
			trimWhitespace: true,
		},
	});

	// Check if bad words should be filtered.
	if (configuration?.validateCommitBadWords) {
		// Filter the message.
		const filteredMessage = filterBadWords({ message, configuration: configuration?.badWordsOptions ?? {} });

		if (isBoolean(filteredMessage)) {
			return null;
		}

		message = filteredMessage;
	}

	// Commit the message.
	commitMessage(message);
};

export default { prompter: CommitJazzerPrompter };
