import { styleText } from 'node:util';
import { isDefined, isEmpty } from 'remeda';

import type { CommitType } from '../../core/commit-types';
import type { MessageData } from '../../core/message';
import type { AskQuestionsInput, AskSearchInput, AskTextInput, CheckAnswerInput, CounterInput } from './prompts.types';

import { interpolate } from '../../core/i18n';
import {
  AnswerError,
  createChoiceSearch,
  createCommitTypeSearch,
  SEARCH_PAGE_SIZE,
  validateAnswer
} from '../../core/questions';
import { MESSAGES } from '../../shared/messages';

const askSearch = async <Value>({
  message,
  source,
  validate,
  suggested,
  context
}: AskSearchInput<Value>): Promise<Value> => {
  const { default: search } = await import('@inquirer/search');

  return search(
    {
      message,
      source,
      validate,
      pageSize: SEARCH_PAGE_SIZE,
      ...(isDefined(suggested) ? { default: suggested } : {})
    },
    context
  );
};

const counter = ({ value, maxLength }: CounterInput) => {
  const { length } = value.trim();
  const text = isDefined(maxLength) ? `${length}/${maxLength}` : `${length}`;

  return styleText(isDefined(maxLength) && length > maxLength ? 'red' : 'dim', `(${text})`);
};

/** Asks the questions one by one; the chosen type also brings its emoji and code. */
export const askQuestions = async ({
  questions,
  translations,
  ask,
  preset = {},
  defaults = {},
  extraQuestions = [],
  limitLength,
  findProfaneWords,
  context
}: AskQuestionsInput): Promise<MessageData> => {
  const answers: MessageData = {};
  const messages = { ...translations.validation, prohibitedWords: translations.messages.prohibitedWords };

  const check = ({ question, value, maxLength }: CheckAnswerInput) => {
    const valid = validateAnswer({ value, question, messages, maxLength, findProfaneWords });

    if (valid !== true) {
      throw new AnswerError({ code: 'invalid', field: question.key, reason: valid });
    }

    return value.trim();
  };

  const askText = async ({ question, maxLength }: AskTextInput) => {
    const validate = (value: string) => validateAnswer({ value, question, messages, maxLength, findProfaneWords });

    if (question.choices && !isEmpty(question.choices.values)) {
      const source = createChoiceSearch({
        choices: question.choices,
        required: question.required,
        labels: {
          none: translations.messages.noScope,
          custom: (value) => interpolate({ text: translations.messages.customScope, values: { value } })
        }
      });

      return askSearch({ message: question.message, source, validate, context });
    }

    const { default: input } = await import('@inquirer/input');

    return input(
      {
        message: question.message,
        default: defaults[question.key],
        required: question.required,
        transformer: (value, { isFinal }) => (isFinal ? value : `${value} ${counter({ value, maxLength })}`),
        validate
      },
      context
    );
  };

  const answerType = async (commitTypes: CommitType[]) => {
    const given = preset.type ?? (ask === 'all' ? undefined : defaults.type);

    if (isDefined(given)) {
      const type = commitTypes.find(({ name }) => name === given);

      if (!type) {
        throw new AnswerError({
          code: 'unknown-type',
          field: 'type',
          reason: interpolate({ text: translations.messages.unknownType, values: { type: given } })
        });
      }

      return type;
    }

    if (ask === 'none') {
      throw new AnswerError({ code: 'missing', field: 'type', reason: MESSAGES.answer.none });
    }

    return askSearch({
      message: questions.find(({ key }) => key === 'type')?.message ?? '',
      source: createCommitTypeSearch(commitTypes),
      suggested: commitTypes.find(({ name }) => name === defaults.type),
      context
    });
  };

  for (const question of questions) {
    if (question.kind === 'type') {
      const type = await answerType(question.commitTypes);

      Object.assign(answers, { type: type.name, emoji: type.emoji, code: type.code });

      continue;
    }

    const maxLength = limitLength?.({ question, answers }) ?? question.maxLength;
    const given = preset[question.key];
    const fallback = defaults[question.key] ?? '';
    // A required question without an answer is asked whenever there is a terminal.
    const mustAsk = question.required && !fallback;

    if (isDefined(given)) {
      answers[question.key] = check({ question, value: given, maxLength });
    } else if (ask === 'all' || (ask === 'required' && mustAsk)) {
      answers[question.key] = (await askText({ question, maxLength })).trim();
    } else if (mustAsk) {
      throw new AnswerError({ code: 'missing', field: question.key, reason: MESSAGES.answer.none });
    } else {
      answers[question.key] = check({ question, value: fallback, maxLength });
    }
  }

  // An answer given up front counts even when its question is not asked; it is held to the same limits.
  extraQuestions
    .filter(({ key }) => isDefined(preset[key]) && !questions.some((question) => question.key === key))
    .forEach((question) => {
      answers[question.key] = check({
        question: { ...question, required: false },
        value: preset[question.key] ?? '',
        maxLength: limitLength?.({ question, answers })
      });
    });

  return answers;
};
