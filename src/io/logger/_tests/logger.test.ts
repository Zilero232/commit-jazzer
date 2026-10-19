import { stripVTControlCharacters } from 'node:util';
import { describe, expect, it } from 'vitest';

import { captureOutput } from '../../../shared/testing/helpers';
import { logger } from '../logger';

describe('logger', () => {
  it.each(['info', 'warn', 'error', 'success'] as const)(
    'writes %s to stderr with the prefix, never to stdout',
    (level) => {
      const output = captureOutput();

      logger[level]('hello');

      expect(stripVTControlCharacters(output.stderr())).toBe('[commit-jazzer] hello\n');
      expect(output.stdout()).toBe('');
    }
  );
});
