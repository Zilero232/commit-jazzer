import { z } from 'zod';

import type { ParseConfigInput, ResolvedConfig } from './config.types';

import { MESSAGES } from '../../shared/messages';
import { configSchema } from './config.schema';

export class ConfigError extends Error {
  override name = 'ConfigError';
}

/**
 * Validates a raw config and applies the defaults.
 *
 * @throws {ConfigError} with every issue listed when the config is invalid.
 */
export const parseConfig = ({ config, source = 'config' }: ParseConfigInput): ResolvedConfig => {
  const result = configSchema.safeParse(config ?? {});

  if (!result.success) {
    throw new ConfigError(MESSAGES.config.invalid({ source, details: z.prettifyError(result.error) }));
  }

  return result.data;
};
