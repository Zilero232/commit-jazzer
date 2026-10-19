import { z } from 'zod';

import { COMMIT_FIELDS, LANGUAGES } from '../../shared/constants';
import { STYLES } from '../../shared/style';
import { BUILT_IN_COMMIT_TYPE_NAMES, resolveCommitTypes } from '../commit-types';
import { DEFAULT_BANNER_TEXT, DEFAULT_PROMPT_QUESTIONS, DEFAULT_TEMPLATE, FIGLET_LAYOUTS } from './config.constants';
import { FIGLET_FONTS } from './figlet-fonts.constants';

const styleSchema = z.enum(STYLES).meta({ description: 'A `util.styleText` style, e.g. `blue` or `bgGray`.' });

// Alias names end up on the command line (`jazzer :deps`).
const nameSchema = z.string().regex(/^[\w-]+$/, 'Use letters, digits, `_` or `-`');

// Type names end up in the header, which Conventional Commits parsers read with `\w+`: no `-`.
const TYPE_NAME = /^\w+$/;

export const commitTypeSchema = z.strictObject({
  emoji: z
    .string()
    .min(1)
    .meta({ description: 'Emoji inserted into the commit message.', examples: ['🚀'] }),
  code: z
    .string()
    .min(1)
    .meta({ description: 'Shortcode of the emoji.', examples: [':rocket:'] }),
  description: z
    .string()
    .meta({ description: 'Description shown in the type selection.', examples: ['Deploying application'] })
});

const questionSchema = z.strictObject({
  key: z.enum(COMMIT_FIELDS).meta({ description: 'Field the question fills.' }),
  message: z.string().min(1).optional().meta({ description: 'Question text. Overrides the translation.' }),
  options: z
    .strictObject({
      required: z.boolean().optional().meta({ description: 'The answer cannot be empty.' }),
      skip: z.boolean().optional().meta({ description: 'Do not ask this question.' }),
      validations: z
        .strictObject({
          length: z
            .strictObject({
              minMessageLength: z.int().nonnegative().optional().meta({ description: 'Minimum answer length.' }),
              maxMessageLength: z.int().positive().optional().meta({ description: 'Maximum answer length.' })
            })
            .optional()
            .meta({ description: 'Length limits of the answer.' })
        })
        .optional()
        .meta({ description: 'Answer validation.' })
    })
    .optional()
    .meta({ description: 'How the question behaves.' })
});

export const profanityOptionsSchema = z
  .strictObject({
    additionalBlockWords: z.array(z.string().min(1)).default([]).meta({ description: 'Extra words to block.' }),
    excludedWords: z.array(z.string()).default([]).meta({ description: 'Words that are never blocked.' }),
    placeholder: z.string().min(1).default('*').meta({ description: 'Character a blocked word is masked with.' }),
    overrideBlockWords: z
      .boolean()
      .default(false)
      .meta({ description: 'Block only `additionalBlockWords`, without the built-in list.' })
  })
  .prefault({})
  .meta({ description: 'The word list.' });

const badWordsSchema = z
  .strictObject({
    checkHasProfaneWords: z.boolean().default(true).meta({ description: 'Reject answers that contain blocked words.' }),
    replaceProfaneWords: z.boolean().default(false).meta({ description: 'Mask blocked words with the placeholder.' }),
    clearMessage: z.boolean().default(false).meta({ description: 'Remove blocked words from the message.' }),
    options: profanityOptionsSchema
  })
  .prefault({})
  .meta({ description: 'What the profanity filter does with blocked words.' });

const bannerSchema = z
  .strictObject({
    bannerText: z.string().default(DEFAULT_BANNER_TEXT).meta({ description: 'Text rendered with figlet.' }),
    figletOptions: z
      .strictObject({
        font: z.enum(FIGLET_FONTS).default('Standard').meta({ description: 'Figlet font name.' }),
        horizontalLayout: z.enum(FIGLET_LAYOUTS).default('default').meta({ description: 'Horizontal letter spacing.' }),
        verticalLayout: z.enum(FIGLET_LAYOUTS).default('default').meta({ description: 'Vertical line spacing.' }),
        width: z.int().positive().optional().meta({ description: 'Maximum width before figlet wraps the text.' }),
        whitespaceBreak: z.boolean().default(true).meta({ description: 'Wrap only at spaces.' })
      })
      .prefault({})
      .meta({ description: 'Options passed to figlet.' }),
    options: z
      .strictObject({
        color: styleSchema.default('blue').meta({ description: 'Style of the banner text.' }),
        separator: z.string().default('⭐').meta({ description: 'Characters of the line under the banner.' }),
        separatorColor: styleSchema.default('gray').meta({ description: 'Style of both separator lines.' }),
        footerMessages: z
          .array(z.strictObject({ text: z.string(), color: styleSchema.optional() }))
          .default([])
          .meta({ description: 'Lines printed between the separators.' }),
        footerSeparator: z.string().default('⭐').meta({ description: 'Characters of the line after the footer.' }),
        bottomSpacing: z.int().nonnegative().default(1).meta({ description: 'Empty lines after the banner.' })
      })
      .prefault({})
      .meta({ description: 'Colors, separators and footer of the banner.' })
  })
  .prefault({})
  .meta({ description: 'What the banner shows when `showBanner` is on.' });

const answerSchema = (description: string) => z.string().optional().meta({ description });

// The answers of an alias: `type` and `title` are required, like in a commit made by hand.
const aliasSchema = z
  .strictObject({
    type: z.string().min(1).meta({ description: 'Commit type.' }),
    component: answerSchema('Scope.'),
    title: z.string().min(1).meta({ description: 'Title.' }),
    description: answerSchema('Description.'),
    breaking: answerSchema('Breaking change.'),
    issues: answerSchema('Related issues.'),
    comment: answerSchema('Extra body paragraph.')
  })
  .meta({ description: 'Answers for a commit made often, used with `jazzer :name`.' });

export const configSchema = z
  .strictObject({
    $schema: z.string().optional().meta({ description: 'JSON Schema for editor autocompletion.' }),
    language: z.enum(LANGUAGES).default('en').meta({ description: 'Language of the prompts.' }),
    template: z
      .string()
      .min(1)
      .default(DEFAULT_TEMPLATE)
      .meta({
        description: [
          'Handlebars template of the commit message.',
          'Available: `type`, `emoji`, `code`, `component`, `scope` (the component in parentheses), `bang` (`!` for breaking changes),',
          '`title`, `description`, `comment`, `breaking`, `issues`, `issuePrefix` and `issueFooter` (one `<issuePrefix> <issue>` line per issue).'
        ].join(' '),
        examples: ['{{type}}{{scope}}{{bang}}: {{code}} {{title}}']
      }),
    headerMaxLength: z.int().positive().default(100).meta({
      description: 'Maximum length of the first line. The title counter accounts for the type, scope and emoji.'
    }),
    bodyLineLength: z
      .int()
      .nonnegative()
      .default(100)
      .meta({ description: 'Wrap body lines at this width; `0` turns wrapping off. Footer lines are never wrapped.' }),
    breaklineChar: z
      .string()
      .default('|')
      .meta({ description: 'Typing this in the description starts a new line; an empty string turns it off.' }),
    lowercaseTitle: z.boolean().default(true).meta({
      description: 'Lower-case the first letter of the title and drop a trailing period, as commitlint expects.'
    }),
    scopes: z
      .array(z.string().min(1))
      .default([])
      .meta({ description: 'Scopes offered with autocompletion in the component question. Free text when empty.' }),
    allowCustomScopes: z.boolean().default(true).meta({ description: 'Accept a scope that is not in `scopes`.' }),
    issuePrefix: z
      .string()
      .min(1)
      .default('Closes')
      .meta({ description: 'Footer token written before each related issue.' }),
    inferFromBranch: z.boolean().default(true).meta({
      description: 'In a terminal, suggest the type and the issue from the branch name, e.g. `feat/PROJ-12-login`.'
    }),
    useCommitlint: z.boolean().default(true).meta({
      description: 'Take `scopes` and the length limits from the commitlint config when this config does not set them.'
    }),
    aliases: z
      .record(nameSchema, aliasSchema)
      .default({})
      .meta({ description: 'Ready answers for frequent commits: `jazzer :name` commits them without questions.' }),
    confirmCommit: z
      .boolean()
      .default(true)
      .meta({ description: 'Show the final message and ask to commit, edit it in $EDITOR or cancel.' }),
    availableCommitTypes: z.array(z.enum(BUILT_IN_COMMIT_TYPE_NAMES)).default([]).meta({
      description: 'Built-in commit types to offer; all of them when empty. Custom types are always offered.'
    }),
    availablePromptQuestions: z
      .array(z.enum(COMMIT_FIELDS))
      .default(DEFAULT_PROMPT_QUESTIONS)
      .refine((questions) => questions.includes('type') && questions.includes('title'), {
        message: 'Must include "type" and "title": a commit message needs both'
      })
      .meta({
        description: 'Questions to ask, at least `type` and `title`. They are always asked in the built-in order.'
      }),
    baseCommitTypes: z
      .partialRecord(z.enum(BUILT_IN_COMMIT_TYPE_NAMES), commitTypeSchema.partial())
      .default({})
      .meta({ description: 'Overrides for built-in commit types.' }),
    addCustomCommitTypes: z
      .record(z.string().min(1), commitTypeSchema)
      .default({})
      .meta({ description: 'Additional commit types, keyed by name.' }),
    baseQuestionsOptions: z
      .array(questionSchema)
      .default([])
      .meta({ description: 'Overrides for the built-in questions.' }),
    validateCommitBadWords: z.boolean().default(true).meta({ description: 'Run the profanity filter.' }),
    badWordsOptions: badWordsSchema,
    showBanner: z.boolean().default(false).meta({ description: 'Show a figlet banner before the questions.' }),
    showBannerOptions: bannerSchema
  })
  // Checks across fields: type names, and aliases against the rest of the config (not only when they are used).
  .superRefine((config, context) => {
    const types = new Set(resolveCommitTypes(config).map(({ name }) => name));

    Object.keys(config.addCustomCommitTypes)
      .filter((name) => !TYPE_NAME.test(name))
      .forEach((name) => {
        context.addIssue({
          code: 'custom',
          path: ['addCustomCommitTypes', name],
          message: `"${name}": use letters, digits or "_"; Conventional Commits parsers read no "-" in a type`
        });
      });

    Object.entries(config.aliases).forEach(([name, alias]) => {
      if (!types.has(alias.type)) {
        context.addIssue({
          code: 'custom',
          path: ['aliases', name, 'type'],
          message: `"${alias.type}" is not an available commit type`
        });
      }

      if (alias.component && !config.allowCustomScopes && !config.scopes.includes(alias.component)) {
        context.addIssue({
          code: 'custom',
          path: ['aliases', name, 'component'],
          message: `"${alias.component}" is not in scopes`
        });
      }
    });
  })
  .meta({
    title: 'commit-jazzer configuration',
    description: 'Configuration of the commit-jazzer CLI and Commitizen adapter.'
  });
