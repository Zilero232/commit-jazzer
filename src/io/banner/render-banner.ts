import figlet from 'figlet';
import { styleText } from 'node:util';
import { isEmpty, isTruthy } from 'remeda';
import stringWidth from 'string-width';

import type { PaintInput, RenderBannerInput } from './banner.types';

import { fillWidth } from './banner.utils';

/** Renders the figlet banner framed by separators, with the footer messages under it. figlet reads its font from disk. */
export const renderBanner = ({ banner, colors }: RenderBannerInput): string => {
  const { bannerText, figletOptions, options } = banner;

  const paint = ({ style, text }: PaintInput) => (colors ? styleText(style, text, { validateStream: false }) : text);

  const art = bannerText ? figlet.textSync(bannerText, figletOptions).trimEnd() : '';
  const footer = options.footerMessages;
  // Both separators span the widest line of the art and the footer.
  const width = Math.max(
    1,
    ...[...art.split('\n'), ...footer.map(({ text }) => text)].map((line) => stringWidth(line))
  );
  const rule = (pattern: string) => paint({ style: options.separatorColor, text: fillWidth({ pattern, width }) });

  const lines = [
    art && paint({ style: options.color, text: art }),
    rule(options.separator),
    ...footer.map(({ text, color = 'white' }) => paint({ style: color, text })),
    !isEmpty(footer) && rule(options.footerSeparator)
  ].filter(isTruthy);

  return lines.join('\n') + '\n'.repeat(options.bottomSpacing);
};
