import type { HookScriptInput } from './init.types';

import { PACKAGE_NAME } from '../../../shared/constants';

// Identifies hooks written by `jazzer init`; only those are replaced or removed.
export const HOOK_MARKER = `# Added by \`${PACKAGE_NAME} init\``;

// Runs the project's copy, then a global one; without either the commit goes on as if there were no hook.
const hookScript = ({ purpose, command }: HookScriptInput) => `#!/bin/sh
${HOOK_MARKER}: ${purpose}.
if [ -x node_modules/.bin/${PACKAGE_NAME} ]; then
  exec node_modules/.bin/${PACKAGE_NAME} ${command}
fi
if command -v ${PACKAGE_NAME} >/dev/null 2>&1; then
  exec ${PACKAGE_NAME} ${command}
fi
exit 0
`;

// What each hook runs: for the script, and for the line to add to a hook someone else wrote.
export const HOOK_COMMANDS = {
  'prepare-commit-msg': 'hook "$1" "$2"',
  'commit-msg': 'lint "$1"'
} as const;

export type HookName = keyof typeof HOOK_COMMANDS;

export const HOOKS: Record<HookName, string> = {
  'prepare-commit-msg': hookScript({
    purpose: `asks the ${PACKAGE_NAME} questions on \`git commit\``,
    command: HOOK_COMMANDS['prepare-commit-msg']
  }),
  'commit-msg': hookScript({
    purpose: 'checks messages written without the questions, e.g. `git commit -m`',
    command: HOOK_COMMANDS['commit-msg']
  })
};

export const LOCAL_SCHEMA = `./node_modules/${PACKAGE_NAME}/schema.json`;

// The config files `init` writes; with --force one replaces the other.
export const INIT_CONFIG_FILES = { json: 'jazzer.config.json', ts: 'jazzer.config.ts' } as const;

export const TS_CONFIG = `import { defineConfig } from '${PACKAGE_NAME}';

export default defineConfig({});
`;
