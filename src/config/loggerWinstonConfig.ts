import type { LoggerOptions } from 'winston';

import { format, transports } from 'winston';

import { LogLevel } from '@/types/modules/winston';

const { colorize, prettyPrint, combine, timestamp, printf } = format;

const loggerWinstonConfig: LoggerOptions = {
	level: LogLevel.INFO,
	transports: [
		new transports.Console({
			format: combine(
				colorize({
					level: true,
					message: true,
				}),
				prettyPrint(),
				timestamp({
					format: 'YYYY-MM-DD HH:mm:ss',
				}),
				printf(info => {
					return `${info.timestamp as string} ${info.level}: ${info.message as string}`;
				}),
			),
		}),
	],
};

export default loggerWinstonConfig;
