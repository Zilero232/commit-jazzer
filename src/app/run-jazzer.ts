import { isDefined } from 'remeda';

import type { RunJazzerInput, RunJazzerResult } from './app.types';

import { getTranslations } from '../core/i18n';
import { createMessage } from '../core/message';
import { createProfanityFilter } from '../core/profanity';
import { AnswerError, buildQuestions, createLengthLimit, inferFromBranch } from '../core/questions';
import { resolveRunPolicy } from '../core/run-policy';
import { loadConfig } from '../io/config-loader';
import { getCurrentBranch } from '../io/git';
import { askQuestions, isPromptAbort } from '../io/prompts';
import { isTerminalInput } from '../io/terminal';
import { COMMIT_FIELDS } from '../shared/constants';
import { MESSAGES } from '../shared/messages';
import { confirmUntilValid } from './confirm-until-valid';
import { resolvePreset } from './resolve-preset';

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
  const policy = resolveRunPolicy({ config, interactive, yes, alias: isDefined(alias), confirm, showBanner });
  const preset = resolvePreset({ config, flags, alias });

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

    return await confirmUntilValid({ config, answers, message: result.message, translations, context });
  } catch (error) {
    if (isPromptAbort(error)) {
      return { status: 'cancelled', interrupted: true };
    }

    // An alias names itself in the error: the user typed no flag for its answers.
    if (error instanceof AnswerError && isDefined(alias) && !isDefined(flags[error.field])) {
      throw new AnswerError({
        code: error.code,
        field: error.field,
        reason: MESSAGES.answer.inAlias({ reason: error.reason, alias })
      });
    }

    throw error;
  }
};
