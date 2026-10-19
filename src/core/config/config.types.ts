import type { z } from 'zod';

import type { configSchema, profanityOptionsSchema } from './config.schema';

/** User configuration as written in a config file. Every field is optional. */
export type JazzerConfig = z.input<typeof configSchema>;

/** Configuration with every default applied. */
export type ResolvedConfig = z.output<typeof configSchema>;

export type BannerOptions = ResolvedConfig['showBannerOptions'];

export type ProfanityOptions = z.input<typeof profanityOptionsSchema>;

export type ParseConfigInput = {
  /** The raw config, e.g. a parsed JSON file. `undefined` means no config. */
  config: unknown;
  /** Where the config came from; named in the error. */
  source?: string;
};
