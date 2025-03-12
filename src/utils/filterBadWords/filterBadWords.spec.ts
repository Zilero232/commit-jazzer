import type { Mock } from 'vitest';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import BadWordFilter from 'pure-flow-ai';

import LOG_MESSAGES from '@/constants/logMessages';

import { filterBadWords } from './filterBadWords';

vi.mock('@/lib/BadWordFilter');
vi.mock('@/constants/logMessages');

describe('filterBadWords', () => {
	const message = 'This is a test message with badword';

	const mockHasProfaneWords = vi.fn();
	const mockMaskProfanity = vi.fn();
	const mockCleanString = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(BadWordFilter as Mock).mockReturnValue({
			hasProfaneWords: mockHasProfaneWords,
			maskProfanity: mockMaskProfanity,
			cleanString: mockCleanString,
		});
	});

	it('should return false when prohibited words are found', () => {
		mockHasProfaneWords.mockReturnValue(['badword']);

		const configuration = {
			checkHasProfaneWords: true,
			replaceProfaneWords: false,
			clearMessage: false,
		};

		const result = filterBadWords({ message, configuration });

		expect(result).toBe(false);
		expect(LOG_MESSAGES.PROHIBITED_WORDS_ERROR).toHaveBeenCalledWith(['badword']);
	});

	it('should return the original message when no forbidden actions are required', () => {
		const configuration = {
			checkHasProfaneWords: false,
			replaceProfaneWords: false,
			clearMessage: false,
		};

		const result = filterBadWords({ message, configuration });

		expect(result).toBe(message);
	});

	it('should do not need to call functions to work with bad words if the necessary parameters are not passed', () => {
		mockHasProfaneWords.mockReturnValue([]);
		mockMaskProfanity.mockReturnValue(message);
		mockCleanString.mockReturnValue(message);

		const configuration = {
			checkHasProfaneWords: false,
			replaceProfaneWords: false,
			clearMessage: false,
		};

		const result = filterBadWords({ message, configuration });

		expect(result).toBe(message);

		expect(mockHasProfaneWords).not.toHaveBeenCalled();
		expect(mockMaskProfanity).not.toHaveBeenCalled();
		expect(mockCleanString).not.toHaveBeenCalled();
	});
});
