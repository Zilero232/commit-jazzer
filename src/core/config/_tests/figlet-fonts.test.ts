import figlet from 'figlet';
import { describe, expect, it } from 'vitest';

import { FIGLET_FONTS } from '../figlet-fonts.constants';

describe('FIGLET_FONTS', () => {
  it('lists exactly the fonts of the installed figlet (run `bun run generate-fonts` after an upgrade)', () => {
    expect([...FIGLET_FONTS].sort()).toEqual(figlet.fontsSync().sort());
  });
});
