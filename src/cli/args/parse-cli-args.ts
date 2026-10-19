import { parseArgs } from 'node:util';
import { isDefined, omitBy } from 'remeda';

import type { CommitAnswers } from '../../core/message';
import type { CliCommand, ParseInput, ParseOptions } from './cli-args.types';

import { COMMANDS, COMMIT_OPTIONS, HOOK_OPTIONS, INIT_OPTIONS, LINT_OPTIONS } from './cli-args.constants';

const COMMAND_NAMES = new Set<string>(COMMANDS);

// `-b` → `--body`, to name the long form in hints.
const LONG_NAMES = new Map<string, string>(
  Object.entries(COMMIT_OPTIONS).flatMap(([name, option]) =>
    'short' in option ? [[`-${option.short}`, `--${name}`]] : []
  )
);

export class CliArgsError extends Error {
  override name = 'CliArgsError';
}

// Node's own messages talk about positionals and `--`, which here means "pass to git": say what to do instead.
const explain = (message: string) => {
  const unknown = /Unknown option '([^']+)'/.exec(message);

  if (unknown) {
    return `Unknown option ${unknown[1]}. Options of git commit go after "--": jazzer -- ${unknown[1]}`;
  }

  const ambiguous = /Option '(-\w|--[\w-]+)/.exec(message);

  if (message.includes('ambiguous') && ambiguous?.[1]) {
    const option = LONG_NAMES.get(ambiguous[1]) ?? ambiguous[1];

    return `${message.split('.')[0]}. For a value that starts with "-", write ${option}="-x".`;
  }

  return message.split('\n')[0] ?? message;
};

const parse = <Options extends ParseOptions>({ args, options }: ParseInput<Options>) => {
  try {
    return parseArgs({ args, options, allowPositionals: true, allowNegative: true, strict: true });
  } catch (error) {
    throw new CliArgsError(explain(error instanceof Error ? error.message : String(error)));
  }
};

const parseInit = (args: string[]): CliCommand => {
  const { values, positionals } = parse({ args, options: INIT_OPTIONS });

  if (values.help) {
    return { name: 'help' };
  }

  if (values.version) {
    return { name: 'version' };
  }

  if (positionals.length > 0) {
    throw new CliArgsError(`Unexpected argument "${positionals[0]}" for init.`);
  }

  return {
    name: 'init',
    options: {
      ts: values.ts ?? false,
      hook: values.hook ?? false,
      lint: values.lint ?? false,
      removeHook: values['remove-hook'] ?? false,
      force: values.force ?? false
    }
  };
};

const parseHook = (args: string[]): CliCommand => {
  const { values, positionals } = parse({ args, options: HOOK_OPTIONS });
  const [file, source] = positionals;

  if (values.help) {
    return { name: 'help' };
  }

  if (values.version) {
    return { name: 'version' };
  }

  if (!file) {
    throw new CliArgsError('hook needs the message file: jazzer hook "$1" "$2".');
  }

  return { name: 'hook', options: { file, source, configPath: values.config } };
};

const parseLint = (args: string[]): CliCommand => {
  const { values, positionals } = parse({ args, options: LINT_OPTIONS });

  if (values.help) {
    return { name: 'help' };
  }

  if (values.version) {
    return { name: 'version' };
  }

  if (positionals.length > 1) {
    throw new CliArgsError(`lint takes one message file, got ${positionals.length}.`);
  }

  return { name: 'lint', options: { file: positionals[0], configPath: values.config } };
};

const parseCommit = (args: string[]): CliCommand => {
  // Everything after `--` goes to git untouched, files included.
  const separator = args.indexOf('--');
  const own = separator === -1 ? args : args.slice(0, separator);
  const passthrough = separator === -1 ? [] : args.slice(separator + 1);
  const { values, positionals } = parse({ args: own, options: COMMIT_OPTIONS });

  if (values.help) {
    return { name: 'help' };
  }

  if (values.version) {
    return { name: 'version' };
  }

  const [first, ...rest] = positionals;
  const isAlias = first?.startsWith(':') ?? false;
  const unexpected = isAlias ? rest[0] : first;

  if (unexpected !== undefined && COMMAND_NAMES.has(unexpected)) {
    throw new CliArgsError(`Put the command first: jazzer ${unexpected} [options].`);
  }

  // A typo such as `jazzer innit` must not end up as a commit of the path "innit".
  if (unexpected !== undefined) {
    throw new CliArgsError(
      `Unknown command "${unexpected}". Commands: ${COMMANDS.join(', ')}. Files to commit go after "--".`
    );
  }

  const preset: CommitAnswers = omitBy(
    {
      type: values.type,
      component: values.scope,
      title: values.title,
      description: values.body,
      breaking: values.breaking,
      issues: values.issues,
      comment: values.comment
    },
    (value) => !isDefined(value)
  );

  if (isAlias && values.alias !== undefined) {
    throw new CliArgsError(`Give the alias once: ${first} or --alias ${values.alias}.`);
  }

  if (values.retry && Object.keys(preset).length > 0) {
    throw new CliArgsError('--retry commits the saved message as it is; it takes no answers.');
  }

  return {
    name: 'commit',
    options: {
      dryRun: values['dry-run'] ?? false,
      retry: values.retry ?? false,
      yes: values.yes ?? false,
      banner: values.banner,
      configPath: values.config,
      preset,
      alias: isAlias ? first?.slice(1) : values.alias,
      gitArgs: [
        ...(values.all ? ['--all'] : []),
        ...(values.amend ? ['--amend'] : []),
        ...(values.verify === false ? ['--no-verify'] : []),
        ...passthrough
      ]
    }
  };
};

const PARSERS = { init: parseInit, hook: parseHook, lint: parseLint } as const;

/**
 * Parses the arguments of the `jazzer` command. Pure: no IO.
 *
 * @throws {CliArgsError} for unknown options or commands and missing values.
 */
export const parseCliArgs = (argv: readonly string[]): CliCommand => {
  const [command, ...rest] = argv;
  const parser = COMMANDS.find((name) => name === command);

  return parser ? PARSERS[parser](rest) : parseCommit([...argv]);
};
