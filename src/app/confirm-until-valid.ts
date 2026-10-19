import { isEmpty } from 'remeda';

import type { ConfirmUntilValidInput, RunJazzerResult } from './app.types';

import { isConventionalTemplate, lintMessage, stripComments } from '../core/lint';
import { createMessage } from '../core/message';
import { logger } from '../io/logger';
import { confirmMessage } from '../io/prompts';

/**
 * Shows the message for confirmation. An edited message is held to the same rules as a generated one:
 * it goes back to the confirmation until it passes the lint, then through the profanity settings.
 */
export const confirmUntilValid = async ({
  config,
  answers,
  message: generated,
  translations,
  context
}: ConfirmUntilValidInput): Promise<RunJazzerResult> => {
  const checkFormat = isConventionalTemplate(config.template);
  let message = generated;

  for (;;) {
    const confirmed = await confirmMessage({ message, translations, context });

    if (confirmed === null) {
      return { status: 'cancelled', interrupted: false };
    }

    const edited = confirmed === message ? message : stripComments({ message: confirmed }).trim();

    if (edited === generated) {
      return { status: 'ok', message: edited, answers, config };
    }

    // Everything deleted, or only comments left: like git, treat an empty message as giving up.
    if (!edited) {
      return { status: 'cancelled', interrupted: false };
    }

    const issues = checkFormat ? lintMessage({ message: edited, config }) : [];

    if (isEmpty(issues)) {
      const result = createMessage({ config, answers, message: edited });

      return result.status === 'ok' ? { ...result, answers, config } : result;
    }

    // Back to the confirmation with the edited message, until it passes.
    issues.forEach((issue) => logger.warn(issue.message));
    message = edited;
  }
};
