import stringWidth from 'string-width';

import type { FillWidthInput } from './banner.types';

/** Repeats `pattern` as often as fits into `width` terminal columns (emoji count as two). */
export const fillWidth = ({ pattern, width }: FillWidthInput): string =>
  pattern ? pattern.repeat(Math.max(1, Math.floor(width / Math.max(1, stringWidth(pattern))))) : '';
