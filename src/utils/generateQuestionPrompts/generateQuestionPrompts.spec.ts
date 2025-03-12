import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommitFieldsValues } from '@/types/modules/commit';

import { translations } from '@/translations';
import { CommitActionsEnum } from '@/types/modules/actions';
import { CommitFieldsEnum } from '@/types/modules/commit';
import { LanguageEnum } from '@/types/modules/language';
import { generateQuestionPrompts } from '@/utils';

vi.mock('@/helpers/generateErrorReport', () => ({
	default: vi.fn().mockReturnValue('Mock error report'),
}));

vi.mock('@/helpers/typeGuards', () => ({
	isObject: vi.fn().mockReturnValue(true),
}));

describe('generateQuestionPrompts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should generate default questions correctly', async () => {
		const result = await generateQuestionPrompts({});

		expect(result).toBeInstanceOf(Array);
		// Например, если DEFAULT_QUESTIONS содержит 7 вопросов
		expect(result).toHaveLength(7);
	});

	it('should apply custom question options overrides', async () => {
		const customOptionsType = {
			message: 'Custom message',
			options: {
				required: true,
				skip: false,
				validations: {
					length: {
						maxMessageLength: 100,
						minMessageLength: 100,
					},
				},
			},
		};

		const result = await generateQuestionPrompts({
			baseQuestionsOptions: [
				{
					key: CommitFieldsEnum.ActionType,
					...customOptionsType,
				},
			],
		});

		// Ищем вопрос по ключу "type"
		const customQuestion = result.find((question: Record<string, unknown>) => question.name === CommitFieldsEnum.ActionType);

		expect(customQuestion).toBeDefined();
		expect(customQuestion).toMatchObject({
			when: !customOptionsType.options.skip,
			message: customOptionsType.message,
		});
	});

	it('should apply translations if provided', async () => {
		const result = await generateQuestionPrompts({
			language: LanguageEnum.Russian,
			baseQuestionsOptions: [
				{
					key: CommitFieldsEnum.ActionType,
					message: 'Custom message',
				},
			],
		});

		result.forEach(question => {
			if (question.name === CommitFieldsEnum.ActionType) {
				return (question.message = 'Custom message');
			}

			const translation = translations[LanguageEnum.Russian][question.name as CommitFieldsValues];

			if (translation) {
				expect(question.message).toBe(translation);
			}
		});
	});

	it('should handle autocomplete type correctly for action type', async () => {
		const result = await generateQuestionPrompts({
			availableCommitTypes: [CommitActionsEnum.INIT],
			availablePromptQuestions: [CommitFieldsEnum.ActionType],
		});

		const customQuestion = result.find((question: Record<string, unknown>) => question.name === CommitFieldsEnum.ActionType);

		expect(customQuestion).toBeDefined();
		expect(customQuestion?.source).toBeInstanceOf(Function);
	});
});
