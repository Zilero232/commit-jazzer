// The JSON Schema of the config, generated from the zod schema. `bun run build` writes `schema.json`, shipped
// as `commit-jazzer/schema.json`; the VitePress config writes the site copy, served at the `$schema` URL
// `jazzer init` writes and rendered by the config reference page.
import { writeFile } from 'node:fs/promises';
import { z } from 'zod';

import { configSchema } from '../src/core/config/config.schema';

const OUTPUTS = {
  package: new URL('../schema.json', import.meta.url),
  site: new URL('../site/public/commit-jazzer-schema.json', import.meta.url)
};

export const writeSchema = async (target: keyof typeof OUTPUTS): Promise<void> => {
  const schema = z.toJSONSchema(configSchema, { io: 'input', target: 'draft-2020-12' });

  await writeFile(OUTPUTS[target], `${JSON.stringify(schema, null, 2)}\n`);
};

if (import.meta.main) {
  await writeSchema('package');
}
