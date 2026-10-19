import { relative } from 'node:path';
import { isPlainObject } from 'remeda';

import type { LoadConfigInput, LoadedConfig } from './config-loader.types';

import { fromCommitlintRules, parseConfig } from '../../core/config';
import { findConfig } from './find-config';
import { loadCommitlintRules } from './load-commitlint-rules';

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

  // Inside the project the short relative path reads better; outside it, the absolute one does.
  const shown = file ? relative(cwd, file.filepath) : '';
  const source = file ? (shown && !shown.startsWith('..') ? shown : file.filepath) : 'config';

  const useCommitlint = !(isPlainObject(raw) && raw.useCommitlint === false);
  const rules = useCommitlint && isPlainObject(raw) ? await loadCommitlintRules({ cwd }) : undefined;
  const fromCommitlint = rules ? fromCommitlintRules(rules) : {};
  // The team's commitlint rules win over a personal config, never over the project's own.
  const merged = isPlainObject(raw)
    ? file?.origin === 'user'
      ? { ...raw, ...fromCommitlint }
      : { ...fromCommitlint, ...raw }
    : raw;

  return { config: parseConfig({ config: merged, source }), filepath: file?.filepath };
};
