import type { styleText } from 'node:util';

import { inspect } from 'node:util';

/** A single `util.styleText` format: a color, a background color or a modifier. */
export type Style = Exclude<Parameters<typeof styleText>[0], readonly unknown[]>;

export const isStyle = (value: string): value is Style => Object.hasOwn(inspect.colors, value);

export const STYLES = Object.keys(inspect.colors).filter(isStyle);
