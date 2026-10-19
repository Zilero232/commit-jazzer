import type { BannerOptions } from '../../core/config';
import type { Style } from '../../shared/style';

export type RenderBannerInput = {
  banner: BannerOptions;
  /** Whether to emit ANSI colors. */
  colors: boolean;
};

export type FillWidthInput = {
  pattern: string;
  /** Terminal columns. */
  width: number;
};

export type PaintInput = {
  style: Style;
  text: string;
};
