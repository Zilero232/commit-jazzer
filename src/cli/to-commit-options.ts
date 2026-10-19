import { isDefined, isEmpty, isNullish, isTruthy, omitBy } from 'remeda';

import type { CommitAnswers } from '../core/message';
import type { CommitOptions, ToCommitOptionsInput } from './cli.types';

import { MESSAGES } from '../shared/messages';

export class CommitArgsError extends Error {
  override name = 'CommitArgsError';
}

/**
 * Maps the parsed flags of `jazzer` to what `runCommit` needs. Pure.
 *
 * @throws {CommitArgsError} for a positional argument that is not an alias, or flags that contradict each other.
 */
export const toCommitOptions = ({
  alias: positional,
  flags,
  passthrough,
  cwd
}: ToCommitOptionsInput): CommitOptions => {
  // A typo such as `jazzer innit` must not run as anything: the only positional is `:alias`.
  if (isDefined(positional) && !positional.startsWith(':')) {
    throw new CommitArgsError(MESSAGES.cli.unknownCommand(positional));
  }

  if (isDefined(positional) && isDefined(flags.alias)) {
    throw new CommitArgsError(MESSAGES.cli.aliasTwice({ positional, flag: flags.alias }));
  }

  const preset: CommitAnswers = omitBy(
    {
      type: flags.type,
      component: flags.scope,
      title: flags.title,
      description: flags.body,
      breaking: flags.breaking,
      issues: flags.issues,
      comment: flags.comment
    },
    isNullish
  );

  if (flags.retry && !isEmpty(preset)) {
    throw new CommitArgsError(MESSAGES.cli.retryWithAnswers);
  }

  return {
    dryRun: flags.dryRun ?? false,
    retry: flags.retry ?? false,
    yes: flags.yes ?? false,
    banner: flags.banner,
    configPath: flags.config,
    preset,
    alias: positional?.slice(1) ?? flags.alias,
    gitArgs: [flags.all && '--all', flags.amend && '--amend', !flags.verify && '--no-verify', ...passthrough].filter(
      isTruthy
    ),
    cwd
  };
};
