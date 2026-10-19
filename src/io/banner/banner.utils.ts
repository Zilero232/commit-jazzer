import stringWidth from 'string-width';

import type { FillWidthInput } from './banner.types';

/** Repeats `pattern` as often as fits into `width` terminal columns (emoji count as two). */
export const fillWidth = ({ pattern, width }: FillWidthInput): string => {
  if (!pattern) {
    return '';
  }

  const patternWidth = Math.max(1, stringWidth(pattern));
  const times = Math.max(1, Math.floor(width / patternWidth));

  return pattern.repeat(times);
};
