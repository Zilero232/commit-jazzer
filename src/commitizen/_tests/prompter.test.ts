import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runJazzer } from '../../app/run-jazzer';
import { captureOutput, okResult } from '../../shared/testing/helpers';
import { prompter } from '../prompter';

vi.mock('../../app/run-jazzer', () => ({ runJazzer: vi.fn() }));

describe('prompter', () => {
  let output: ReturnType<typeof captureOutput>;

  beforeEach(() => {
    output = captureOutput();
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  it('hands the message to commitizen and leaves the exit code alone', async () => {
    const commit = vi.fn();

    vi.mocked(runJazzer).mockResolvedValue(okResult('feat: ✨ x'));
    await prompter({}, commit);

    expect(commit).toHaveBeenCalledWith('feat: ✨ x');
    expect(process.exitCode).toBeUndefined();
  });

  it('does not commit a blocked message, and says why', async () => {
    const commit = vi.fn();

    vi.mocked(runJazzer).mockResolvedValue({ status: 'blocked', profaneWords: ['x'], reason: 'Blocked: x' });
    await prompter({}, commit);

    expect(commit).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(output.stderr()).toContain('Blocked: x');
  });

  it('does not commit after a cancelled confirmation', async () => {
    vi.mocked(runJazzer).mockResolvedValue({ status: 'cancelled', interrupted: false });
    await prompter({}, vi.fn());

    expect(process.exitCode).toBe(1);
  });

  it('exits with 130 when the prompts are interrupted', async () => {
    vi.mocked(runJazzer).mockResolvedValue({ status: 'cancelled', interrupted: true });
    await prompter({}, vi.fn());

    expect(process.exitCode).toBe(130);
  });

  it('reports a config error', async () => {
    vi.mocked(runJazzer).mockRejectedValue(new Error('Invalid jazzer.config.json'));
    await prompter({}, vi.fn());

    expect(process.exitCode).toBe(1);
    expect(output.stderr()).toContain('Invalid jazzer.config.json');
  });
});
