import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';

import { isTerminalInput, keepOpen } from '../terminal';

const createTty = () => {
  const chunks: string[] = [];
  const tty = Object.assign(new PassThrough(), { columns: 120, rows: 40, isTTY: true });

  tty.on('data', (chunk: unknown) => chunks.push(String(chunk)));

  return { tty, chunks };
};

const tick = () => new Promise((resolve) => setImmediate(resolve));

describe('keepOpen', () => {
  it('keeps writing after end(), as the next prompt does', async () => {
    const { tty, chunks } = createTty();
    const output = keepOpen(tty);

    output.write('first');
    output.end();
    output.write('second');
    await tick();

    expect(chunks).toEqual(['first', 'second']);
    expect(tty.writableEnded).toBe(false);
  });

  it('survives the way inquirer uses it: a stream piped into it and ended', async () => {
    const { tty, chunks } = createTty();
    const output = keepOpen(tty);

    for (const text of ['one', 'two']) {
      const prompt = new PassThrough();

      prompt.pipe(output);
      prompt.end(text);
      await tick();
    }

    expect(chunks).toEqual(['one', 'two']);
  });

  it('calls the callback of end()', async () => {
    const done = await new Promise<boolean>((resolve) => keepOpen(createTty().tty).end(() => resolve(true)));

    expect(done).toBe(true);
  });

  it('reports the size of the terminal', () => {
    expect(keepOpen(createTty().tty)).toMatchObject({ columns: 120, rows: 40, isTTY: true });
  });
});

describe('isTerminalInput', () => {
  it('is false for a plain stream', () => {
    expect(isTerminalInput(new PassThrough())).toBe(false);
  });
});
