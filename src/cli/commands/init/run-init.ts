import { existsSync } from 'node:fs';
import { chmod, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { isDefined, isEmpty, isPlainObject, keys, unique } from 'remeda';

import type { InitOptions } from '../../cli.types';
import type { HookName } from './init.constants';
import type { InitContext, InstallHookInput, WriteConfigInput } from './init.types';

import { isConventionalTemplate } from '../../../core/lint';
import { CONFIG_FILE_NAMES, loadConfig, PACKAGE_JSON_FIELD } from '../../../io/config-loader';
import { getHooksDir, getTopLevel } from '../../../io/git';
import { logger } from '../../../io/logger';
import { SCHEMA_URL } from '../../../shared/constants';
import { MESSAGES } from '../../../shared/messages';
import {
  HOOK_COMMANDS,
  HOOK_MARKER,
  HOOKS,
  INIT_CONFIG_FILES,
  INIT_CONFIG_NAMES,
  LOCAL_SCHEMA,
  TS_CONFIG
} from './init.constants';

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
const resolveHooksDir = async (root: string) => {
  const hooksDir = await getHooksDir({ cwd: root });
  const husky = join(root, '.husky');

  if (hooksDir === join(husky, '_')) {
    return husky;
  }

  // husky is set up in the project, but not in this clone yet: the hook goes where husky will run it.
  if (existsSync(husky) && hooksDir !== husky) {
    logger.warn(MESSAGES.init.huskyInactive);

    return husky;
  }

  return hooksDir;
};

// Hooks written by `jazzer init` carry a marker; a missing file is not one.
const isOurHook = async (path: string) => (await readFile(path, 'utf8').catch(() => '')).includes(HOOK_MARKER);

const installHook = async ({ hooksDir, name }: InstallHookInput) => {
  const path = join(hooksDir, name);

  // A hook someone else wrote is never replaced, --force or not.
  if (existsSync(path) && !(await isOurHook(path))) {
    logger.error(MESSAGES.init.hookExists({ path, command: HOOK_COMMANDS[name] }));

    return false;
  }

  await mkdir(hooksDir, { recursive: true });
  await writeFile(path, HOOKS[name]);
  await chmod(path, 0o755);
  logger.success(MESSAGES.init.installed(path));

  return true;
};

// Looks in both places a hook may have been installed: git's hooks directory and `.husky/`.
const removeHooks = async (root: string) => {
  const dirs = unique([await getHooksDir({ cwd: root }), join(root, '.husky')].filter(isDefined));
  const paths = dirs.flatMap((dir) => keys(HOOKS).map((name) => join(dir, name)));
  const ours = await Promise.all(paths.map(isOurHook));
  const removed = paths.filter((_, index) => ours[index]);

  await Promise.all(removed.map((path) => rm(path)));
  removed.forEach((path) => logger.success(MESSAGES.init.removed(path)));

  if (isEmpty(removed)) {
    logger.info(MESSAGES.init.nothingToRemove);
  }
};

const writeConfig = async ({ root, ts }: WriteConfigInput) => {
  const path = join(root, ts ? INIT_CONFIG_FILES.ts : INIT_CONFIG_FILES.json);
  const $schema = existsSync(join(root, LOCAL_SCHEMA)) ? LOCAL_SCHEMA : SCHEMA_URL;

  await writeFile(path, ts ? TS_CONFIG : `${JSON.stringify({ $schema }, null, 2)}\n`);
  // The other variant would shadow or be shadowed by this one.
  await rm(join(root, ts ? INIT_CONFIG_FILES.json : INIT_CONFIG_FILES.ts), { force: true });
  logger.success(MESSAGES.init.created(path));
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
  const context: InitContext = { root: topLevel ?? cwd, inRepository: isDefined(topLevel) };

  if (removeHook) {
    await removeHooks(context.root);

    return 0;
  }

  const wanted: Record<HookName, boolean> = { 'prepare-commit-msg': hook, 'commit-msg': lint };
  let hooks = keys(HOOKS).filter((name) => wanted[name]);

  if (!isEmpty(hooks) && !context.inRepository) {
    logger.error(MESSAGES.init.notInRepository);

    return 1;
  }

  const [existing] = await findConfigs(context.root);
  const writtenByInit = isDefined(existing) && INIT_CONFIG_NAMES.has(basename(existing));

  if (!existing || (force && writtenByInit)) {
    await writeConfig({ ...context, ts });
  } else if (!isEmpty(hooks)) {
    // `init --hook` in a configured project only adds the hook.
    logger.info(MESSAGES.init.keeping(existing));
  } else {
    logger.error(writtenByInit ? MESSAGES.init.configExists(existing) : MESSAGES.init.configElsewhere(existing));

    return 1;
  }

  // The commit-msg hook checks the Conventional Commits format; a template that writes another one would fail it.
  // The other hook is still installed.
  const lintRejects = lint && !isConventionalTemplate((await loadConfig({ cwd: context.root })).config.template);

  if (lintRejects) {
    logger.error(MESSAGES.init.lintNeedsConventional);
    hooks = hooks.filter((name) => name !== 'commit-msg');
  }

  if (isEmpty(hooks)) {
    return lintRejects ? 1 : 0;
  }

  const hooksDir = await resolveHooksDir(context.root);

  if (!hooksDir) {
    logger.error(MESSAGES.init.notInRepository);

    return 1;
  }

  const installed = await Promise.all(hooks.map((name) => installHook({ hooksDir, name })));

  return !lintRejects && installed.every(Boolean) ? 0 : 1;
};
