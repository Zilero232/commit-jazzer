import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isPlainObject } from 'remeda';

import type { LoadCommitlintRulesInput, TryResolveInput } from './config-loader.types';

import { MESSAGES } from '../../shared/messages';
import { logger } from '../logger';

const tryResolve = ({ from, id }: TryResolveInput): string | undefined => {
  try {
    return from.resolve(id);
  } catch {
    return undefined;
  }
};

// `@commitlint/load` straight from the project, or through `@commitlint/cli`, where pnpm keeps it.
const resolveLoad = (cwd: string): string | undefined => {
  const project = createRequire(join(cwd, 'package.json'));
  const cli = tryResolve({ from: project, id: '@commitlint/cli' });

  return (
    tryResolve({ from: project, id: '@commitlint/load' }) ??
    (cli ? tryResolve({ from: createRequire(cli), id: '@commitlint/load' }) : undefined)
  );
};

/**
 * Loads the rules of the project's commitlint config with the project's own `@commitlint/load`.
 * `undefined` when commitlint is not installed: it is optional, never a dependency. A config that
 * fails to load is reported once and skipped.
 */
export const loadCommitlintRules = async ({
  cwd
}: LoadCommitlintRulesInput): Promise<Record<string, unknown> | undefined> => {
  const modulePath = resolveLoad(cwd);

  if (!modulePath) {
    return undefined;
  }

  try {
    const loaded: unknown = await import(pathToFileURL(modulePath).href);
    // CommonJS builds (v18) export the function as `default.default`, ESM builds (v19+) as `default`.
    const exported = isPlainObject(loaded) ? loaded.default : undefined;
    const load = isPlainObject(exported) ? exported.default : exported;

    if (typeof load !== 'function') {
      return undefined;
    }

    const config: unknown = await load({}, { cwd });

    return isPlainObject(config) && isPlainObject(config.rules) ? config.rules : undefined;
  } catch (error) {
    logger.warn(
      MESSAGES.config.commitlintSkipped(error instanceof Error ? (error.message.split('\n')[0] ?? '') : String(error))
    );

    return undefined;
  }
};
