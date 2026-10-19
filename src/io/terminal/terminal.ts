import { openSync } from 'node:fs';
import { Writable } from 'node:stream';
import { isatty, ReadStream, WriteStream as TtyWriteStream } from 'node:tty';

import type { Terminal } from './terminal.types';

/** Whether answers can be asked for on this input stream. */
export const isTerminalInput = (input: unknown): boolean =>
  input instanceof ReadStream ? input.isTTY : input === process.stdin && isatty(0);

const isCallback = (value: unknown): value is () => void => typeof value === 'function';

// A stream whose end() is ignored: every prompt "ends" it, the next one writes to it again.
class OpenEndedStream extends Writable {
  override end(...args: unknown[]): this {
    // end(callback), end(chunk, callback) and end(chunk, encoding, callback): the callback is always last.
    const done = args.at(-1);

    if (isCallback(done)) {
      queueMicrotask(done);
    }

    return this;
  }
}

/**
 * Wraps a terminal so `end()` leaves it open. Inquirer ends its output after every prompt; on
 * process.stdout that is a no-op, on an opened /dev/tty it would hide every prompt after the first.
 */
export const keepOpen = (tty: Pick<TtyWriteStream, 'columns' | 'isTTY' | 'rows' | 'write'>): Writable =>
  Object.defineProperties(
    new OpenEndedStream({
      write: (chunk, encoding, done) => {
        tty.write(chunk, encoding, done);
      }
    }),
    {
      // Inquirer measures the screen through these.
      columns: { get: () => tty.columns },
      rows: { get: () => tty.rows },
      isTTY: { get: () => tty.isTTY }
    }
  );

/**
 * Opens the controlling terminal (`/dev/tty`). git hooks have no terminal on stdin, but the user still
 * sits at one. `undefined` when there is none: an IDE, a GUI client, Windows outside a terminal.
 */
export const openTerminal = (): Terminal | undefined => {
  try {
    const input = new ReadStream(openSync('/dev/tty', 'r'));
    const tty = new TtyWriteStream(openSync('/dev/tty', 'w'));

    return {
      input,
      output: keepOpen(tty),
      close: () => {
        input.destroy();
        tty.destroy();
      }
    };
  } catch {
    return undefined;
  }
};
