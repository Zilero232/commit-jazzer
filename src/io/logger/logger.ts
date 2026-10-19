import { styleText } from 'node:util';

import type { Level, LogInput } from './logger.types';

import { PACKAGE_NAME } from '../../shared/constants';

const STYLES = {
  info: 'cyan',
  warn: 'yellow',
  error: 'red',
  success: 'green'
} as const satisfies Record<Level, Parameters<typeof styleText>[0]>;

// Everything goes to stderr: stdout is reserved for the prompts and the `--dry-run` message.
const write = ({ level, message }: LogInput) => {
  process.stderr.write(`${styleText(STYLES[level], `[${PACKAGE_NAME}]`, { stream: process.stderr })} ${message}\n`);
};

export const logger = {
  info: (message: string) => write({ level: 'info', message }),
  warn: (message: string) => write({ level: 'warn', message }),
  error: (message: string) => write({ level: 'error', message }),
  success: (message: string) => write({ level: 'success', message })
};
