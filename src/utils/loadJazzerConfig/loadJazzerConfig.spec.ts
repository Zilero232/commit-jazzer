import type { Mock } from 'vitest';

import { cosmiconfig } from 'cosmiconfig';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DEFAULT_CONFIGURATION from '@/config/defaultConfiguration';
import LOG_MESSAGES from '@/constants/logMessages';
import generateErrorReport from '@/helpers/generateErrorReport';
import CommitJazzerPrompterOptionsZodSchema from '@/schema/JazzerZodSchema';

import { loadJazzerConfig } from './loadJazzerConfig';

vi.mock('cosmiconfig');
vi.mock('@/helpers/generateErrorReport');
vi.mock('@/constants/logMessages');
vi.mock('@/schema/JazzerZodSchema');

describe('loadJazzerConfig', async () => {
	const mockCosmiconfig = cosmiconfig as Mock;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return default configuration when no config file is found', async () => {
		mockCosmiconfig.mockReturnValue({
			search: vi.fn().mockResolvedValueOnce(null),
		});

		const result = await loadJazzerConfig();

		expect(result).toEqual(DEFAULT_CONFIGURATION);

		expect(LOG_MESSAGES.CONFIG_LOADER_WARN).toHaveBeenCalled();
	});

	it('should return default configuration when config file is empty or invalid', async () => {
		mockCosmiconfig.mockReturnValue({
			search: vi.fn().mockResolvedValueOnce({
				config: {},
				isEmpty: true,
			}),
		});

		const result = await loadJazzerConfig();

		expect(result).toEqual(DEFAULT_CONFIGURATION);

		expect(LOG_MESSAGES.CONFIG_LOADER_WARN).toHaveBeenCalled();
	});

	it('should log an error and exit if an unexpected error occurs', async () => {
		const error = new Error('Unexpected error');

		mockCosmiconfig.mockReturnValue({
			search: vi.fn().mockRejectedValueOnce(error),
		});

		const exitMock = vi.spyOn(process, 'exit').mockImplementationOnce(vi.fn() as never);

		await loadJazzerConfig();

		expect(LOG_MESSAGES.CONFIG_LOADER_ERROR).toHaveBeenCalledWith(error);
		expect(exitMock).toHaveBeenCalledWith(1);
	});

	it('should exit process on invalid config', async () => {
		const mockInvalidConfig = { key: 'invalidValue' };

		mockCosmiconfig.mockReturnValue({
			search: vi.fn().mockResolvedValueOnce({
				config: mockInvalidConfig,
				isEmpty: false,
			}),
		});

		CommitJazzerPrompterOptionsZodSchema.safeParseAsync = vi.fn().mockResolvedValueOnce({
			success: false,
			error: {
				issues: [{ message: 'Invalid config' }],
			},
		});

		(generateErrorReport as Mock).mockReturnValueOnce('Invalid config');

		const exitMock = vi.spyOn(process, 'exit').mockImplementationOnce(vi.fn() as never);

		await loadJazzerConfig();

		expect(generateErrorReport).toHaveBeenCalledWith({
			issues: [{ message: 'Invalid config' }],
		});

		expect(LOG_MESSAGES.ERROR).toHaveBeenCalledWith('Invalid config');

		expect(exitMock).toHaveBeenCalledWith(1);
	});

	it('should return merged configuration when valid config is found', async () => {
		const mockConfig = {
			language: 'gr',
			badWordsOptions: {
				checkHasProfaneWords: false,
				clearMessage: false,
				replaceProfaneWords: false,
				options: {
					additionalBlockWords: ['bad', 'word'],
				},
			},
		};

		mockCosmiconfig.mockReturnValue({
			search: vi.fn().mockResolvedValueOnce({
				config: mockConfig,
				isEmpty: false,
			}),
		});

		CommitJazzerPrompterOptionsZodSchema.safeParseAsync = vi.fn().mockResolvedValueOnce({
			success: true,
			data: mockConfig,
		});

		const result = await loadJazzerConfig();

		expect(result).toEqual({ ...DEFAULT_CONFIGURATION, ...mockConfig });
	});
});
