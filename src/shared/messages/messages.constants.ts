import { isEmpty } from 'remeda';

import type {
  AliasesInput,
  AliasTwiceInput,
  BodyLengthInput,
  ConfigIssueInput,
  FileReasonInput,
  HeaderLengthInput,
  HookExistsInput,
  InAliasInput,
  NoFieldInput,
  OneOfInput
} from './messages.types';

import { PACKAGE_NAME } from '../constants';

/**
 * Every text the CLI prints and every error it throws, in one place.
 * The prompts are not here: they are translated, see `core/i18n`.
 */
export const MESSAGES = {
  cli: {
    seeHelp: 'Run `jazzer --help` for the options.',
    unknownCommand: (name: string) =>
      `unknown command '${name}'. Commands: init, hook, lint; aliases are written :${name}`,
    aliasTwice: ({ positional, flag }: AliasTwiceInput) => `give the alias once: ${positional} or --alias ${flag}`,
    retryWithAnswers: '--retry commits the saved message as it is; it takes no answers and no alias',
    optionsBeforeCommand: (command: string) =>
      `the options of jazzer do not apply to "${command}": write them after it, e.g. jazzer ${command} -c <path>`,
    passthroughWithCommand: (command: string) => `"--" passes arguments to git commit; "${command}" takes none`,
    missingFlag: (flag: string) => `Missing answer for ${flag}: there is no terminal to ask in.`
  },
  answer: {
    none: 'no answer',
    missing: (field: string) => `Missing answer: ${field}`,
    unknownAlias: ({ alias, known }: AliasesInput) =>
      `Unknown alias ":${alias}". ${isEmpty(known) ? 'The config has no aliases.' : `Known: ${known.join(', ')}`}`,
    inAlias: ({ reason, alias }: InAliasInput) => `${reason} (in alias :${alias})`,
    lost: (placeholder: string) => `the template has no {{${placeholder}}}, so this answer would be lost`
  },
  commit: {
    cancelled: 'Commit cancelled.',
    notInRepository: 'Not inside a git repository.',
    nothingStaged: 'Nothing to commit: stage your changes with `git add` first, or pass --all.',
    noRetryMessage: 'No message to retry: --retry reuses the message of the last `jazzer` commit that failed.',
    noGitDir: 'Could not find the .git directory to write the message to.',
    failed: 'git commit failed. Fix the problem and run `jazzer --retry` to commit the same message.'
  },
  hook: {
    commentLines: (commentChar: string) => `Lines starting with "${commentChar}" will be removed by git as comments.`
  },
  init: {
    created: (path: string) => `Created ${path}`,
    keeping: (path: string) => `Keeping ${path}`,
    configExists: (path: string) => `${path} already exists. Use --force to replace it.`,
    configElsewhere: (path: string) => `${path} holds the config already; edit it there.`,
    installed: (path: string) => `Installed ${path}`,
    removed: (path: string) => `Removed ${path}`,
    nothingToRemove: `No hook from ${PACKAGE_NAME} to remove.`,
    hookExists: ({ path, command }: HookExistsInput) =>
      `${path} already exists. Add this line to it instead: ${PACKAGE_NAME} ${command}`,
    huskyInactive: '.husky/ exists but git does not use it yet: run `npx husky` once so the hook runs.',
    notInRepository: 'Not inside a git repository: cannot install the hook.',
    lintNeedsConventional:
      'The template does not start with {{type}}, so `jazzer lint` would reject its messages. Not installing the commit-msg hook.'
  },
  lint: {
    notInRepository: 'Not inside a git repository: pass the message file, e.g. jazzer lint .git/COMMIT_EDITMSG',
    noFile: (path: string) =>
      `No commit message at ${path}: pass the message file, e.g. jazzer lint .git/COMMIT_EDITMSG`,
    hint: 'Write the message with `jazzer`, or fix it and commit again.',
    header: (header: string) => `The first line must look like "type(scope): subject", got "${header}"`,
    unknownType: ({ value, allowed }: OneOfInput) => `Unknown type "${value}". Use one of: ${allowed.join(', ')}`,
    unknownScope: ({ value, allowed }: OneOfInput) => `Unknown scope "${value}". Use one of: ${allowed.join(', ')}`,
    emptySubject: 'The subject after ": " is empty',
    headerLength: ({ length, max }: HeaderLengthInput) =>
      `The first line has ${length} characters; at most ${max} are allowed`,
    blankLine: 'Leave a blank line after the first line',
    bodyLength: ({ line, length, max }: BodyLengthInput) =>
      `Line ${line} has ${length} characters; at most ${max} are allowed`
  },
  config: {
    invalid: ({ source, details }: ConfigIssueInput) => `Invalid ${source}:\n${details}`,
    unreadable: ({ path, reason }: FileReasonInput) => `Could not read ${path}: ${reason}`,
    notFound: (path: string) => `Config file not found: ${path}`,
    noField: ({ path, field }: NoFieldInput) => `${path} has no "${field}" field.`,
    commitlintSkipped: (reason: string) => `Skipping the commitlint config: ${reason}`,
    requiredQuestions: 'Must include "type" and "title": a commit message needs both',
    requiredQuestion: (key: string) => `"${key}" cannot be skipped or optional: a commit message needs it`,
    placeholderComment: 'Must not start with "#": git would drop a line that starts with a masked word',
    typeName: (name: string) =>
      `"${name}": use letters, digits or "_"; Conventional Commits parsers read no "-" in a type`,
    unknownAliasType: (type: string) => `"${type}" is not an available commit type`,
    unknownAliasScope: (scope: string) => `"${scope}" is not in scopes`
  }
} as const;
