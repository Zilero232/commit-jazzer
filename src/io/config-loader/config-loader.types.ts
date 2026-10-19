import type { LilconfigResult } from 'lilconfig';

import type { ResolvedConfig } from '../../core/config';

export type LoadConfigInput = {
  /** Directory the search starts from. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Explicit config file, relative to `cwd`; skips the search. Defaults to `$JAZZER_CONFIG`. */
  configPath?: string;
  /** Environment to read `JAZZER_CONFIG` and `XDG_CONFIG_HOME` from. Defaults to `process.env`. */
  env?: Partial<Record<string, string>>;
};

export type LoadedConfig = {
  config: ResolvedConfig;
  /** Absolute path of the file the config came from; `undefined` when the defaults are used. */
  filepath?: string;
};

/** Where a config was found: given explicitly, in the project, or the user's own. */
type ConfigOrigin = 'explicit' | 'project' | 'user';

export type FoundConfig = {
  config: unknown;
  filepath: string;
  origin: ConfigOrigin;
};

export type FindConfigInput = Required<Pick<LoadConfigInput, 'cwd' | 'env'>> & Pick<LoadConfigInput, 'configPath'>;

export type ExplorerInput = {
  searchPlaces: string[];
  stopDir?: string;
};

export type FoundInput = {
  result: LilconfigResult;
  origin: ConfigOrigin;
};

export type LoadCommitlintRulesInput = {
  cwd: string;
};
