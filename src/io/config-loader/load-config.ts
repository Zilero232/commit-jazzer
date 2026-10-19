import { relative } from 'node:path';
import { isPlainObject } from 'remeda';

import type { DisplayPathInput, LoadConfigInput, LoadedConfig } from './config-loader.types';

import { fromCommitlintRules, parseConfig } from '../../core/config';
import { findConfig } from './find-config';
import { loadCommitlintRules } from './load-commitlint-rules';

// Inside the project the short relative path reads better; outside it, the absolute one does.
const displayPath = ({ cwd, path }: DisplayPathInput) => {
  const shown = relative(cwd, path);

  return shown && !shown.startsWith('..') ? shown : path;
};

/**
 * Finds the config, fills what it leaves open from the commitlint config, validates it and applies the defaults.
 * Without a config file the defaults are returned.
 *
 * Precedence: the project's (or explicit) config, then the project's commitlint rules, then the user's own config.
 *
 * @throws {ConfigError} when the config cannot be read or is invalid.
 */
export const loadConfig = async ({
  cwd = process.cwd(),
  configPath,
  env = process.env
}: LoadConfigInput = {}): Promise<LoadedConfig> => {
  const file = await findConfig({ cwd, configPath, env });
  const raw: unknown = file?.config ?? {};

  const source = file ? displayPath({ cwd, path: file.filepath }) : 'config';
  const filepath = file?.filepath;

  // Not an object: let the schema report what is wrong with it.
  if (!isPlainObject(raw)) {
    return { config: parseConfig({ config: raw, source }), filepath };
  }

  const rules = raw.useCommitlint === false ? undefined : await loadCommitlintRules({ cwd });
  const fromCommitlint = rules ? fromCommitlintRules(rules) : {};
  // The team's commitlint rules win over a personal config, never over the project's own.
  const merged = file?.origin === 'user' ? { ...raw, ...fromCommitlint } : { ...fromCommitlint, ...raw };

  return { config: parseConfig({ config: merged, source }), filepath };
};
