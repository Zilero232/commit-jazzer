import type { CommitField } from '../../shared/constants';

// Options of each command, in `util.parseArgs` format. Values stay strings: `-i 007` is "007", not 7.

export const COMMIT_OPTIONS = {
  'dry-run': { type: 'boolean', short: 'n' },
  retry: { type: 'boolean', short: 'r' },
  yes: { type: 'boolean', short: 'y' },
  config: { type: 'string', short: 'c' },
  banner: { type: 'boolean' },
  type: { type: 'string', short: 't' },
  scope: { type: 'string', short: 's' },
  title: { type: 'string', short: 'm' },
  body: { type: 'string', short: 'b' },
  breaking: { type: 'string' },
  issues: { type: 'string', short: 'i' },
  comment: { type: 'string' },
  alias: { type: 'string' },
  all: { type: 'boolean', short: 'a' },
  amend: { type: 'boolean' },
  verify: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' }
} as const;

export const INIT_OPTIONS = {
  ts: { type: 'boolean' },
  hook: { type: 'boolean' },
  lint: { type: 'boolean' },
  'remove-hook': { type: 'boolean' },
  force: { type: 'boolean', short: 'f' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' }
} as const;

export const HOOK_OPTIONS = {
  config: { type: 'string', short: 'c' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' }
} as const;

export const LINT_OPTIONS = {
  config: { type: 'string', short: 'c' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' }
} as const;

export const COMMANDS = ['init', 'hook', 'lint'] as const;

// The flag that answers each question, for errors about answers.
export const FIELD_FLAGS = {
  type: 'type',
  component: 'scope',
  title: 'title',
  description: 'body',
  breaking: 'breaking',
  issues: 'issues',
  comment: 'comment'
} as const satisfies Record<CommitField, string>;
