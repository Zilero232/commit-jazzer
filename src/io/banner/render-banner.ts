import figlet from 'figlet';
import { styleText } from 'node:util';
import stringWidth from 'string-width';

import type { PaintInput, RenderBannerInput } from './banner.types';

import { fillWidth } from './banner.utils';

/** Renders the figlet banner framed by separators, with the footer messages under it. figlet reads its font from disk. */
export const renderBanner = ({ banner, colors }: RenderBannerInput): string => {
  const { bannerText, figletOptions, options } = banner;

  const paint = ({ style, text }: PaintInput) => (colors ? styleText(style, text, { validateStream: false }) : text);

  const art = bannerText ? figlet.textSync(bannerText, figletOptions).replace(/\s+$/, '') : '';
  const lines = [...(art ? art.split('\n') : []), ...options.footerMessages.map(({ text }) => text)];
  const width = Math.max(1, ...lines.map((line) => stringWidth(line)));
  const separator = paint({ style: options.separatorColor, text: fillWidth({ pattern: options.separator, width }) });

  return [
    ...(art ? [paint({ style: options.color, text: art })] : []),
    separator,
    ...(options.footerMessages.length > 0
      ? [
          ...options.footerMessages.map(({ text, color }) => paint({ style: color ?? 'white', text })),
          paint({ style: options.separatorColor, text: fillWidth({ pattern: options.footerSeparator, width }) })
        ]
      : []),
    ...Array.from({ length: options.bottomSpacing }).fill('')
  ].join('\n');
};
