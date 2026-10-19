// Writes the JSON Schema of the config, generated from the zod schema: `bun run generate-schema`.
// schema.json ships in the npm package (`commit-jazzer/schema.json`); the docs copy is served by GitHub Pages
// at the URL `jazzer init` puts into `$schema`, and the config reference page is rendered from it.
import { writeFile } from 'node:fs/promises';
import { z } from 'zod';

import { configSchema } from '../src/core/config/config.schema';

const OUTPUTS = ['../schema.json', '../docs/public/commit-jazzer-schema.json'].map(
  (path) => new URL(path, import.meta.url)
);

const schema = `${JSON.stringify(z.toJSONSchema(configSchema, { io: 'input', target: 'draft-2020-12' }), null, 2)}\n`;

await Promise.all(OUTPUTS.map((output) => writeFile(output, schema)));

console.log(`JSON Schema written to ${OUTPUTS.map(({ pathname }) => pathname).join(', ')}`);
