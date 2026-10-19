import { match } from 'ts-pattern';

import type { ReportErrorInput, RunJazzerResult } from './app.types';

import { AnswerError } from '../core/questions';
import { logger } from '../io/logger';

/** Logs why there is no message; returns the message when there is one. */
export const reportResult = (result: RunJazzerResult): string | undefined =>
  match(result)
    .with({ status: 'ok' }, ({ message }) => message)
    .with({ status: 'blocked' }, ({ reason }) => {
      logger.error(reason);

      return undefined;
    })
    .with({ status: 'cancelled' }, () => {
      logger.warn('Commit cancelled.');

      return undefined;
    })
    .exhaustive();

/** The exit code for a run without a message: 130 for Ctrl+C, like a shell, 1 otherwise. */
export const exitCodeOf = (result: RunJazzerResult): number =>
  result.status === 'cancelled' && result.interrupted ? 130 : 1;

/** Logs an error from the flow (a ConfigError, an AnswerError, …) and returns the exit code. */
export const reportError = ({ error, describe }: ReportErrorInput): number => {
  if (error instanceof AnswerError) {
    logger.error(describe?.(error) ?? (error.code === 'missing' ? `Missing answer: ${error.field}` : error.message));
  } else if (error instanceof Error) {
    logger.error(error.message);
  } else {
    logger.error(String(error));
  }

  return 1;
};
