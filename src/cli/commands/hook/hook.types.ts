import type { Terminal } from '../../../io/terminal';
import type { HookOptions } from '../../cli.types';

export type RunHookInput = HookOptions & {
  /** Opens the terminal to ask in; `/dev/tty` by default, replaceable in tests. */
  open?: () => Terminal | undefined;
};
