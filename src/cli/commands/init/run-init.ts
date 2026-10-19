import { existsSync } from 'node:fs';
import { chmod, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { isPlainObject } from 'remeda';

import type { InitOptions } from '../../args';
import type { HookName } from './init.constants';
import type { HookInput, InitContext, WriteConfigInput } from './init.types';

import { isConventionalTemplate } from '../../../core/lint';
import { CONFIG_FILE_NAMES, loadConfig, PACKAGE_JSON_FIELD } from '../../../io/config-loader';
import { getHooksDir, getTopLevel } from '../../../io/git';
import { logger } from '../../../io/logger';
import { PACKAGE_NAME, SCHEMA_URL } from '../../../shared/constants';
import { HOOK_COMMANDS, HOOK_MARKER, HOOKS, INIT_CONFIG_FILES, LOCAL_SCHEMA, TS_CONFIG } from './init.constants';

const hasJazzerField = async (path: string) => {
  try {
    const json: unknown = JSON.parse(await readFile(path, 'utf8'));

    return isPlainObject(json) && PACKAGE_JSON_FIELD in json;
  } catch {
    return false;
  }
};

/** Config files in the repository root, in search order; `package.json` only with a "jazzer" field. */
const findConfigs = async (root: string) => {
  const paths = CONFIG_FILE_NAMES.map((name) => join(root, name)).filter((path) => existsSync(path));
  const flags = await Promise.all(
    paths.map(async (path) => basename(path) !== 'package.json' || (await hasJazzerField(path)))
  );

  return paths.filter((_, index) => flags[index]);
};

// husky (v9) points core.hooksPath at `.husky/_`, its generated wrappers, and runs the scripts in `.husky/`.
const hookPath = async ({ root, inRepository, name }: HookInput) => {
  if (!inRepository) {
    return undefined;
  }

  const hooksDir = await getHooksDir({ cwd: root });
  const husky = join(root, '.husky');

  if (hooksDir === join(husky, '_') || (existsSync(husky) && hooksDir !== husky)) {
    if (hooksDir !== join(husky, '_')) {
      logger.warn('.husky/ exists but git does not use it yet: run `npx husky` once so the hook runs.');
    }

    return join(husky, name);
  }

  return hooksDir ? join(hooksDir, name) : undefined;
};

const isOurHook = async (path: string) => (await readFile(path, 'utf8').catch(() => '')).includes(HOOK_MARKER);

const installHook = async (input: HookInput) => {
  const path = await hookPath(input);

  if (!path) {
    return false;
  }

  // A hook someone else wrote is never replaced, --force or not.
  if (existsSync(path) && !(await isOurHook(path))) {
    logger.error(`${path} already exists. Add this line to it instead: ${PACKAGE_NAME} ${HOOK_COMMANDS[input.name]}`);

    return false;
  }

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, HOOKS[input.name]);
  await chmod(path, 0o755);
  logger.success(`Installed ${path}`);

  return true;
};

const removeHooks = async (context: InitContext) => {
  const names: HookName[] = ['prepare-commit-msg', 'commit-msg'];
  const paths = await Promise.all(names.map((name) => hookPath({ ...context, name })));
  const ours = await Promise.all(
    paths.map(async (path) => (path && existsSync(path) && (await isOurHook(path)) ? path : undefined))
  );
  const removed = ours.filter((path) => path !== undefined);

  await Promise.all(removed.map((path) => rm(path)));
  removed.forEach((path) => logger.success(`Removed ${path}`));

  if (removed.length === 0) {
    logger.info(`No hook from ${PACKAGE_NAME} to remove.`);
  }
};

const writeConfig = async ({ root, ts }: WriteConfigInput) => {
  const path = join(root, ts ? INIT_CONFIG_FILES.ts : INIT_CONFIG_FILES.json);
  const $schema = existsSync(join(root, LOCAL_SCHEMA)) ? LOCAL_SCHEMA : SCHEMA_URL;

  await writeFile(path, ts ? TS_CONFIG : `${JSON.stringify({ $schema }, null, 2)}\n`);
  // The other variant would shadow or be shadowed by this one.
  await rm(join(root, ts ? INIT_CONFIG_FILES.json : INIT_CONFIG_FILES.ts), { force: true });
  logger.success(`Created ${path}`);
};

/**
 * `jazzer init`: creates a config in the repository root; `--hook` also installs the prepare-commit-msg hook,
 * `--lint` the commit-msg hook, `--remove-hook` removes both.
 */
export const runInit = async ({
  ts,
  hook,
  lint,
  removeHook,
  force,
  cwd = process.cwd()
}: InitOptions): Promise<number> => {
  const topLevel = await getTopLevel({ cwd });
  const context: InitContext = { root: topLevel ?? cwd, inRepository: topLevel !== undefined };
  const hooks: HookName[] = [
    ...(hook ? ['prepare-commit-msg' as const] : []),
    ...(lint ? ['commit-msg' as const] : [])
  ];

  if (removeHook) {
    await removeHooks(context);

    return 0;
  }

  if (hooks.length > 0 && !context.inRepository) {
    logger.error('Not inside a git repository: cannot install the hook.');

    return 1;
  }

  const [existing] = await findConfigs(context.root);
  const replaceable =
    existing !== undefined && new Set<string>(Object.values(INIT_CONFIG_FILES)).has(basename(existing));

  if (!existing || (force && replaceable)) {
    await writeConfig({ ...context, ts });
  } else if (hooks.length > 0 && !force) {
    // `init --hook` in a configured project only adds the hook.
    logger.info(`Keeping ${existing}`);
  } else {
    logger.error(
      replaceable
        ? `${existing} already exists. Use --force to replace it.`
        : `${existing} holds the config already; edit it there.`
    );

    return 1;
  }

  // The commit-msg hook checks the Conventional Commits format; a template that writes another one would fail it.
  if (lint && !isConventionalTemplate((await loadConfig({ cwd: context.root })).config.template)) {
    logger.error(
      'The template does not start with {{type}}, so `jazzer lint` would reject its messages. Not installing the commit-msg hook.'
    );

    return 1;
  }

  const installed = await Promise.all(hooks.map((name) => installHook({ ...context, name })));

  return installed.every(Boolean) ? 0 : 1;
};
