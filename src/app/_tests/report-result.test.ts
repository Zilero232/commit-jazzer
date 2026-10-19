import { describe, expect, it } from 'vitest';

import { AnswerError } from '../../core/questions';
import { captureOutput, okResult } from '../../shared/testing/helpers';
import { exitCodeOf, reportError, reportResult } from '../report-result';

describe('reportResult', () => {
  it('returns the message of a successful run', () => {
    expect(reportResult(okResult('feat: ✨ x'))).toBe('feat: ✨ x');
  });

  it('logs why there is no message', () => {
    const output = captureOutput();

    expect(reportResult({ status: 'blocked', profaneWords: ['x'], reason: 'Blocked: x' })).toBeUndefined();
    expect(reportResult({ status: 'cancelled', interrupted: false })).toBeUndefined();
    expect(output.stderr()).toContain('Blocked: x');
    expect(output.stderr()).toContain('Commit cancelled.');
  });
});

describe('exitCodeOf', () => {
  it('is 130 for Ctrl+C, like a shell, and 1 otherwise', () => {
    expect(exitCodeOf({ status: 'cancelled', interrupted: true })).toBe(130);
    expect(exitCodeOf({ status: 'cancelled', interrupted: false })).toBe(1);
    expect(exitCodeOf({ status: 'blocked', profaneWords: [], reason: '' })).toBe(1);
  });
});

describe('reportError', () => {
  it('logs the message and returns 1', () => {
    const output = captureOutput();

    expect(reportError({ error: new Error('Invalid jazzer.config.json') })).toBe(1);
    expect(reportError({ error: 'plain text' })).toBe(1);
    expect(output.stderr()).toContain('Invalid jazzer.config.json');
    expect(output.stderr()).toContain('plain text');
  });

  it('lets the caller phrase answer errors', () => {
    const output = captureOutput();
    const error = new AnswerError({ code: 'missing', field: 'title', reason: 'no answer' });

    reportError({ error });
    reportError({ error, describe: () => 'Missing answer for --title' });

    expect(output.stderr()).toContain('Missing answer: title');
    expect(output.stderr()).toContain('Missing answer for --title');
  });
});
