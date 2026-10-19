import { isDefined, isEmpty } from 'remeda';

import type { CommitType } from '../commit-types';
import type { BuildQuestionsInput, LocalizeTypesInput, Question } from './questions.types';

import { COMMIT_FIELDS } from '../../shared/constants';
import { resolveCommitTypes } from '../commit-types';
import { interpolate } from '../i18n';
import { templateFields } from '../message';
import { FIELD_DEFAULTS } from './questions.constants';

// Built-in types are described in the prompt language, unless the config gives a description of its own.
const localizeTypes = ({ config, translations }: LocalizeTypesInput): CommitType[] => {
  const described = new Map(Object.entries(translations.commitTypes));
  const own = new Set([
    ...Object.keys(config.addCustomCommitTypes),
    ...Object.entries(config.baseCommitTypes)
      .filter(([, type]) => isDefined(type?.description))
      .map(([name]) => name)
  ]);

  return resolveCommitTypes(config).map((type) =>
    own.has(type.name) ? type : { ...type, description: described.get(type.name) ?? type.description }
  );
};

/** Turns the config into the list of questions to ask, in the built-in order. */
export const buildQuestions = ({ config, translations, keys }: BuildQuestionsInput): Question[] => {
  // A question whose answer the template never writes is not asked: `{{type}}: {{title}}` asks two.
  const written = templateFields(config.template);
  const asked = new Set(keys ?? config.availablePromptQuestions.filter((key) => written.has(key)));

  return COMMIT_FIELDS.filter((key) => asked.has(key)).flatMap((key): Question[] => {
    const override = config.baseQuestionsOptions.find((question) => question.key === key);
    const options = override?.options ?? {};

    // Explicit keys are built even when skipped: they validate answers given by flag.
    if (options.skip && !isDefined(keys)) {
      return [];
    }

    if (key === 'type') {
      const message = override?.message ?? translations.questions.type;

      return [{ kind: 'type', key, message, commitTypes: localizeTypes({ config, translations }) }];
    }

    const hint =
      key === 'description' && config.breaklineChar
        ? ` (${interpolate({ text: translations.questions.breaklineHint, values: { char: config.breaklineChar } })})`
        : '';
    const length = options.validations?.length ?? {};

    return [
      {
        kind: 'text',
        key,
        message: override?.message ?? `${translations.questions[key]}${hint}`,
        required: options.required ?? FIELD_DEFAULTS[key].required,
        minLength: length.minMessageLength ?? 0,
        maxLength: length.maxMessageLength ?? FIELD_DEFAULTS[key].maxLength,
        // Scopes become a pick-or-type list when the config names some.
        choices:
          key === 'component' && !isEmpty(config.scopes)
            ? { values: config.scopes, allowCustom: config.allowCustomScopes }
            : undefined
      }
    ];
  });
};
