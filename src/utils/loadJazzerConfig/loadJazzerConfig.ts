import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import process from 'node:process';
import { merge } from 'ts-deepmerge';

import type { CommitJazzerPrompterOptions } from '@/types/index';

import DEFAULT_CONFIGURATION from '@/config/defaultConfiguration';
import { CONFIG_FILE_NAMES, COSMICONFIG_MODULE_NAME } from '@/constants/configPlugin';
import LOG_MESSAGES from '@/constants/logMessages';
import generateErrorReport from '@/helpers/generateErrorReport';
import { isObject } from '@/helpers/typeGuards';
import CommitJazzerPrompterOptionsZodSchema from '@/schema/JazzerZodSchema';

/**
 * Loads the configuration for the CommitJazzerPrompter.
 *
 * The function returns a promise that resolves to either the loaded configuration or null if the configuration is invalid.
 *
 * The configuration is loaded using the `cosmiconfig` package, which searches for configuration files in the following order:
 * - '.jazzer.config.json',
	- 'jazzer.config.json',
	- '.jazzer.config.js',
	- 'jazzer.config.js',
	- '.jazzer.config.ts',
	- 'jazzer.config.ts',
 *
 * The function returns the merged configuration with the default configuration.
 */
export const loadJazzerConfig = async (): Promise<CommitJazzerPrompterOptions> => {
	try {
		const explorer = cosmiconfig(COSMICONFIG_MODULE_NAME, {
			cache: true,
			searchPlaces: CONFIG_FILE_NAMES,
			loaders: {
				'.ts': TypeScriptLoader(),
			},
		});

		const foundedFile = await explorer.search();

		if (!foundedFile || foundedFile.isEmpty || !isObject(foundedFile)) {
			LOG_MESSAGES.CONFIG_LOADER_WARN();

			return DEFAULT_CONFIGURATION;
		}

		const config: unknown = foundedFile.config;

		// Check the validity of the configuration using ZOD.
		const parseResult = await CommitJazzerPrompterOptionsZodSchema.safeParseAsync(config);

		// If the configuration is not valid, we print an error message and exit the process.
		if (!parseResult.success) {
			const errorMessage = generateErrorReport({
				issues: parseResult.error.issues,
			});

			LOG_MESSAGES.ERROR(errorMessage);

			process.exit(1);
		}

		const data = parseResult.data as CommitJazzerPrompterOptions;

		// If the configuration is valid, we merge it with the default configuration.
		return merge.withOptions(
			{
				mergeArrays: false,
			},
			DEFAULT_CONFIGURATION,
			data,
		);
	} catch (error: unknown) {
		LOG_MESSAGES.CONFIG_LOADER_ERROR(error as Error);

		process.exit(1);
	}
};
