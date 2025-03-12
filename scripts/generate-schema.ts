import type { PartialArgs } from 'typescript-json-schema';

import { existsSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { generateSchema, getProgramFromFiles } from 'typescript-json-schema';

const TS_CONFIG_PATH = 'tsconfig.json';
const TYPE_FILE_PATH = 'src/types/index.ts';
const TYPE_NAME = 'CommitJazzerPrompterOptions';
const OUTPUT_PATH = 'public/commit-jazzer-schema.json';

// Console styling
const colors = {
	success: '\x1B[32m%s\x1B[0m', // Green
	error: '\x1B[31m%s\x1B[0m', // Red
	info: '\x1B[36m%s\x1B[0m', // Cyan
};

// Settings for schema generation
const settings: PartialArgs = {
	required: true,
	ref: false,
	skipLibCheck: true,
};

// Check if file exists
const checkFileExists = (path: string, description: string) => {
	if (!existsSync(path)) {
		console.error(colors.error, `❌ Error: ${description} not found at path ${path}`);

		process.exit(1);
	}

	console.warn(colors.info, `✓ ${description} found`);
};

try {
	console.warn(colors.info, '🚀 Starting JSON schema generation...');

	checkFileExists(TS_CONFIG_PATH, 'TypeScript config');
	checkFileExists(TYPE_FILE_PATH, 'Type definitions file');

	const program = getProgramFromFiles([TYPE_FILE_PATH], {}, TS_CONFIG_PATH);

	console.warn(colors.info, '📝 Program AST successfully created');

	const schema = generateSchema(program, TYPE_NAME, settings);

	if (schema) {
		writeFileSync(OUTPUT_PATH, JSON.stringify(schema, null, 2), 'utf-8');

		console.warn(colors.success, `✨ JSON schema successfully generated at: ${OUTPUT_PATH}`);
	} else {
		console.error(colors.error, '❌ Schema generation failed: Schema object is null');

		process.exit(1);
	}
} catch (error) {
	console.error(colors.error, '❌ An error occurred during schema generation:');

	console.error(error);

	process.exit(1);
}
