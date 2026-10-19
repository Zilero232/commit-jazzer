import type { Loader } from 'lilconfig';

import { defaultLoaders, lilconfig } from 'lilconfig';
import { existsSync } from 'node:fs';
import { realpath } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ExplorerInput, FindConfigInput, FoundConfig, FoundInput } from './config-loader.types';

import { ConfigError } from '../../core/config';
import { PACKAGE_NAME } from '../../shared/constants';
import { getTopLevel } from '../git';
import {
  CONFIG_ENV_VARIABLE,
  CONFIG_FILE_NAMES,
  GLOBAL_CONFIG_DIR,
  GLOBAL_CONFIG_FILE_NAMES,
  HOME_CONFIG_FILE_NAMES,
  PACKAGE_JSON_FIELD,
  SCRIPT_EXTENSIONS
} from './config-loader.constants';

// `import { defineConfig } from 'commit-jazzer'` must work in a config even when the package is installed
// globally or run with npx, so the import resolves to this very copy.
const selfAlias = (): Record<string, string> => {
  try {
    return { [PACKAGE_NAME]: fileURLToPath(import.meta.resolve(PACKAGE_NAME)) };
  } catch {
    return {};
  }
};

// jiti is loaded only for script configs: JSON configs and no config at all skip its startup cost.
const scriptLoader: Loader = async (filepath) => {
  const { createJiti } = await import('jiti');
  const jiti = createJiti(import.meta.url, { moduleCache: false, fsCache: false, alias: selfAlias() });

  return jiti.import(filepath, { default: true });
};

// Every loader names its file when it fails: "Could not read .jazzerrc: Unexpected token …".
const withPath =
  (loader: Loader): Loader =>
  async (filepath, content) => {
    try {
      return await loader(filepath, content);
    } catch (error) {
      throw new ConfigError(`Could not read ${filepath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

const LOADERS = Object.fromEntries([
  ...Object.entries(defaultLoaders).map(([extension, loader]) => [extension, withPath(loader)] as const),
  ...SCRIPT_EXTENSIONS.map((extension) => [`.${extension}`, withPath(scriptLoader)] as const)
]);

const explorer = ({ searchPlaces, stopDir }: ExplorerInput) =>
  lilconfig(PACKAGE_NAME, { searchPlaces, packageProp: PACKAGE_JSON_FIELD, loaders: LOADERS, stopDir });

const found = ({ result, origin }: FoundInput): FoundConfig | undefined =>
  result && !result.isEmpty ? { config: result.config, filepath: result.filepath, origin } : undefined;

/**
 * Finds the raw config: `configPath` (or `$JAZZER_CONFIG`); otherwise a project config between `cwd` and the
 * repository root; otherwise the user's own config in `~/.config/commit-jazzer/` or `~/.jazzerrc`.
 *
 * The project search stops at the repository root on purpose: a config is code, and directories above the
 * repository (a shared `/tmp`, say) are not the project's.
 */
export const findConfig = async ({ cwd, configPath, env }: FindConfigInput): Promise<FoundConfig | undefined> => {
  const explicit = configPath ?? env[CONFIG_ENV_VARIABLE];

  if (explicit) {
    const path = resolve(cwd, explicit);

    if (!existsSync(path)) {
      throw new ConfigError(`Config file not found: ${path}`);
    }

    const result = await explorer({ searchPlaces: CONFIG_FILE_NAMES }).load(path);

    if (basename(path) === 'package.json' && (result?.config ?? undefined) === undefined) {
      throw new ConfigError(`${path} has no "${PACKAGE_JSON_FIELD}" field.`);
    }

    return found({ result, origin: 'explicit' });
  }

  // Real paths on both ends: with a symlinked cwd the stop directory would never be reached.
  const start = await realpath(cwd);
  const root = (await getTopLevel({ cwd: start })) ?? start;
  const project = await explorer({ searchPlaces: CONFIG_FILE_NAMES, stopDir: root }).search(start);

  const projectConfig = found({ result: project, origin: 'project' });

  if (projectConfig) {
    return projectConfig;
  }

  const home = env.HOME || homedir();
  const globalDir = join(env.XDG_CONFIG_HOME || join(home, '.config'), GLOBAL_CONFIG_DIR);
  const user =
    (await explorer({ searchPlaces: GLOBAL_CONFIG_FILE_NAMES, stopDir: globalDir }).search(globalDir)) ??
    (await explorer({ searchPlaces: HOME_CONFIG_FILE_NAMES, stopDir: home }).search(home));

  return found({ result: user, origin: 'user' });
};
