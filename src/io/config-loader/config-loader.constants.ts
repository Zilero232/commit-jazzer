import { PACKAGE_NAME } from '../../shared/constants';

// Name of the `package.json` field that may hold the configuration.
export const PACKAGE_JSON_FIELD = 'jazzer';

/** Path to a config file; used when `--config` is not given. */
export const CONFIG_ENV_VARIABLE = 'JAZZER_CONFIG';

export const SCRIPT_EXTENSIONS = ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs'];

const CONFIG_EXTENSIONS = ['json', ...SCRIPT_EXTENSIONS];

// Searched from the working directory up to the repository root; the first match wins.
export const CONFIG_FILE_NAMES = [
  'package.json',
  '.jazzerrc',
  '.jazzerrc.json',
  ...CONFIG_EXTENSIONS.map((extension) => `.jazzer.config.${extension}`),
  ...CONFIG_EXTENSIONS.map((extension) => `jazzer.config.${extension}`)
];

// The user's own config, used when the project has none: `~/.config/commit-jazzer/config.json`, then `~/.jazzerrc`.
export const GLOBAL_CONFIG_DIR = PACKAGE_NAME;

export const GLOBAL_CONFIG_FILE_NAMES = CONFIG_EXTENSIONS.map((extension) => `config.${extension}`);

export const HOME_CONFIG_FILE_NAMES = ['.jazzerrc', '.jazzerrc.json'];
