import { stripVTControlCharacters } from 'node:util';
import stringWidth from 'string-width';
import { describe, expect, it } from 'vitest';

import { isStyle } from '../../../shared/style';
import { resolvedConfig } from '../../../shared/testing/helpers';
import { fillWidth } from '../banner.utils';
import { renderBanner } from '../render-banner';

const banner = (options: object = {}) =>
  resolvedConfig({ showBannerOptions: { bannerText: 'Hi', options: { bottomSpacing: 0, ...options } } })
    .showBannerOptions;

describe('renderBanner', () => {
  it('renders the figlet art over a separator as wide as the art', () => {
    const lines = renderBanner({ banner: banner(), colors: false }).split('\n');
    const art = lines.slice(0, -1);

    expect(art.join('\n')).toContain('| | | (_)');
    expect(stringWidth(lines.at(-1) ?? '')).toBeLessThanOrEqual(Math.max(...art.map((line) => stringWidth(line))));
  });

  it('frames the footer messages with both separators', () => {
    const lines = renderBanner({
      banner: banner({ footerMessages: [{ text: 'hello' }], footerSeparator: '-' }),
      colors: false
    }).split('\n');

    expect(lines.slice(-2)).toEqual(['hello', expect.stringMatching(/^-+$/)]);
  });

  it('emits ANSI codes only with colors', () => {
    const plain = renderBanner({ banner: banner(), colors: false });
    const colored = renderBanner({ banner: banner(), colors: true });

    expect(stripVTControlCharacters(plain)).toBe(plain);
    expect(stripVTControlCharacters(colored)).toBe(plain);
    expect(colored).not.toBe(plain);
  });

  it('renders only the separator when the text is empty', () => {
    expect(renderBanner({ banner: { ...banner(), bannerText: '' }, colors: false })).toBe('⭐');
  });
});

describe('fillWidth', () => {
  it('fills the width, counting emoji as two columns', () => {
    expect(stringWidth(fillWidth({ pattern: '⭐', width: 10 }))).toBe(10);
    expect(fillWidth({ pattern: '-', width: 3 })).toBe('---');
    expect(fillWidth({ pattern: '', width: 3 })).toBe('');
  });
});

describe('isStyle', () => {
  it('knows the styles of util.styleText', () => {
    expect(isStyle('bgGray')).toBe(true);
    expect(isStyle('pink')).toBe(false);
  });
});
