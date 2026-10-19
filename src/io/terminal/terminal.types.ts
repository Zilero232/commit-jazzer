import type { Readable, Writable } from 'node:stream';

export type Terminal = {
  input: Readable;
  output: Writable;
  /** Closes the streams that were opened for it. */
  close: () => void;
};
