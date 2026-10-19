import type { RunJazzerInput, RunJazzerResult } from './app.types';

import { getTranslations } from '../core/i18n';
import { isConventionalTemplate, lintMessage, stripComments } from '../core/lint';
import { createMessage, templateFields } from '../core/message';
import { createProfanityFilter } from '../core/profanity';
import { AnswerError, buildQuestions, createLengthLimit, inferFromBranch } from '../core/questions';
import { resolveRunPolicy } from '../core/run-policy';
import { loadConfig } from '../io/config-loader';
import { getCurrentBranch } from '../io/git';
import { logger } from '../io/logger';
import { askQuestions, confirmMessage, isPromptAbort } from '../io/prompts';
import { isTerminalInput } from '../io/terminal';
import { COMMIT_FIELDS } from '../shared/constants';

/**
 * The flow shared by the CLI, the git hook and the Commitizen adapter: load the config, show the banner,
 * ask the questions, build and confirm the message. Committing is up to the caller.
 *
 * @throws {ConfigError} for an invalid config, {AnswerError} for an unusable answer or alias.
 */
export const runJazzer = async (input: RunJazzerInput = {}): Promise<RunJazzerResult> => {
  const { showBanner, confirm, preset: flags = {}, alias, yes, context, cwd, configPath, env } = input;
  const { config } = await loadConfig({ cwd, configPath, env });
  const translations = getTranslations(config.language);
  const output = context?.output ?? process.stdout;
  const interactive = input.interactive ?? isTerminalInput(context?.input ?? process.stdin);
  const policy = resolveRunPolicy({ config, interactive, yes, alias: alias !== undefined, confirm, showBanner });

  // `Object.hasOwn`: `jazzer :constructor` must not find Object.prototype.constructor.
  if (alias !== undefined && !Object.hasOwn(config.aliases, alias)) {
    const known = Object.keys(config.aliases).map((name) => `:${name}`);

    throw new Error(
      `Unknown alias ":${alias}". ${known.length > 0 ? `Known: ${known.join(', ')}` : 'The config has no aliases.'}`
    );
  }

  const preset = { ...(alias === undefined ? {} : config.aliases[alias]), ...flags };
  const written = templateFields(config.template);

  // An answer the template never writes would be lost without a word: a breaking change, say.
  const lost = COMMIT_FIELDS.find((field) => preset[field] && !written.has(field));

  if (lost) {
    throw new AnswerError({
      code: 'invalid',
      field: lost,
      reason: `the template has no {{${lost === 'component' ? 'scope' : lost}}}, so this answer would be lost`
    });
  }

  // Decoration only: never in pipes or scripts. Loaded on use, as figlet reads its fonts from disk.
  if (policy.banner && 'isTTY' in output && output.isTTY) {
    const { renderBanner } = await import('../io/banner');

    output.write(`${renderBanner({ banner: config.showBannerOptions, colors: true })}\n`);
  }

  const { badWordsOptions } = config;
  // Rejecting a blocked word while it is typed beats rejecting the finished message.
  const checkWhileTyping = config.validateCommitBadWords && badWordsOptions.checkHasProfaneWords;
  const questions = buildQuestions({ config, translations });
  const commitTypes = questions.flatMap((question) => (question.kind === 'type' ? question.commitTypes : []));
  const branch = policy.useBranch ? await getCurrentBranch({ cwd }) : undefined;

  try {
    const answers = await askQuestions({
      questions,
      translations,
      ask: policy.ask,
      preset,
      defaults: branch ? inferFromBranch({ branch, commitTypes }) : {},
      extraQuestions: buildQuestions({ config, translations, keys: COMMIT_FIELDS }).flatMap((question) =>
        question.kind === 'text' ? [question] : []
      ),
      limitLength: createLengthLimit({ config, questions }),
      findProfaneWords: checkWhileTyping ? createProfanityFilter(badWordsOptions.options).findProfaneWords : undefined,
      context
    });

    const result = createMessage({ config, answers });

    if (result.status === 'blocked') {
      return result;
    }

    if (!policy.confirm) {
      return { ...result, answers, config };
    }

    // An edited message is held to the same rules as a generated one: back to the confirmation until it passes.
    const checkFormat = isConventionalTemplate(config.template);
    let message = result.message;

    for (;;) {
      const confirmed = await confirmMessage({ message, translations, context });

      if (confirmed === null) {
        return { status: 'cancelled', interrupted: false };
      }

      if (confirmed === message) {
        const final = message === result.message ? result : createMessage({ config, answers, message });

        return final.status === 'ok' ? { ...final, answers, config } : final;
      }

      message = stripComments({ message: confirmed }).trim();

      const issues = checkFormat ? lintMessage({ message, config }) : [];

      issues.forEach((issue) => logger.warn(issue.message));

      if (issues.length === 0) {
        const final = createMessage({ config, answers, message });

        return final.status === 'ok' ? { ...final, answers, config } : final;
      }
    }
  } catch (error) {
    if (isPromptAbort(error)) {
      return { status: 'cancelled', interrupted: true };
    }

    // An alias names itself in the error: the user typed no flag for its answers.
    if (error instanceof AnswerError && alias !== undefined && flags[error.field] === undefined) {
      throw new AnswerError({ code: error.code, field: error.field, reason: `${error.reason} (in alias :${alias})` });
    }

    throw error;
  }
};
