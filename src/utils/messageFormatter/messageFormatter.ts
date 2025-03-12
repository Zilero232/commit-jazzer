import { compile } from 'handlebars';

import { isEmptyObject, isObject } from '@/helpers/typeGuards';

interface MessageFormatterOptions {
	defaultEmptyValue?: string;
	removeEmptyFields?: boolean;
	trimWhitespace?: boolean;
}

interface FormatMessageProps<T> {
	data: T;
	options?: MessageFormatterOptions;
	template: string;
}

/**
 * Formats a message using a Handlebars template and provided data.
 *
 * @template T - The type of the data object.
 * @param {FormatMessageProps<T>} props - The properties required for formatting the message.
 * @param {string} props.template - The Handlebars template string.
 * @param {T} props.data - The data to be interpolated into the template.
 * @param {MessageFormatterOptions} [props.options] - Optional formatting options.
 * @param {string} [props.options.defaultEmptyValue] - The default value to use for empty fields.
 * @param {boolean} [props.options.removeEmptyFields] - Whether to remove fields with empty values.
 * @param {boolean} [props.options.trimWhitespace] - Whether to trim whitespace from string fields.
 *
 * @returns {string} - The formatted message.
 */
export const messageFormatter = <T>({ template, data, options = {} }: FormatMessageProps<T>): string => {
	if (!data || !isObject(data) || isEmptyObject(data)) {
		return '';
	}

	const { defaultEmptyValue = '', removeEmptyFields = true, trimWhitespace = true } = options;

	// Preparation of the function template.
	const compiledTemplate = compile(template);

	// Data preparation based on options.
	const processedData = (Object.entries(data) as [keyof T, T[keyof T]][]).reduce((acc, [key, value]) => {
		if (value || !removeEmptyFields) {
			// Check if value is a string before calling .trim()
			const preparedValue = trimWhitespace && typeof value === 'string' ? value.trim() : value;

			acc[key] = (preparedValue || defaultEmptyValue) as NonNullable<T[keyof T]>;
		}

		return acc;
	}, {} as Partial<T>);

	// Compilation and application of the template.
	let message = compiledTemplate(processedData);

	// Trim whitespace.
	if (trimWhitespace) {
		message = message.trim();
	}

	return message;
};
