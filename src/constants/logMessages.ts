import logMessage from '@/helpers/logMessage';
import { LogLevel } from '@/types/modules/winston';

import { PLUGIN_NAME } from './configPlugin';

const LOG_MESSAGES = {
	INFO: (message: string) => {
		return logMessage({
			level: LogLevel.INFO,
			message: `[${PLUGIN_NAME}] - ${message}`,
		});
	},

	WARN: (message: string) => {
		return logMessage({
			level: LogLevel.WARN,
			message: `[${PLUGIN_NAME}] - ${message}`,
		});
	},

	ERROR: (message: string) => {
		return logMessage({
			level: LogLevel.ERROR,
			message: `[${PLUGIN_NAME}] - ${message}`,
		});
	},

	CONFIG_LOADER_WARN: () => {
		return logMessage({
			level: LogLevel.WARN,
			message: `[${PLUGIN_NAME}] - [ConfigLoader] No valid configuration file found. Using default configuration.`,
		});
	},

	CONFIG_LOADER_ERROR: (error: Error) => {
		return logMessage({
			level: LogLevel.ERROR,
			message: `[${PLUGIN_NAME}] - Unexpected error while loading configuration: ${error.message}.`,
		});
	},

	PROHIBITED_WORDS_ERROR: (foundBadWords: string[]) => {
		return logMessage({
			level: LogLevel.ERROR,
			message: `[${PLUGIN_NAME}] - Input contains prohibited words: ${foundBadWords.join(', ')}. Please remove them.`,
		});
	},
};

export default LOG_MESSAGES;
