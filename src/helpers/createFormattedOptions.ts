import LOG_MESSAGES from '@/constants/logMessages';
import { messageFormatter } from '@/utils';

interface CreateFormattedOptionsProps<T> {
	data: T[];
	formatOptions?: {
		templateShowFormat?: string;
		templateValueFormat?: Record<string, keyof T>;
	};
}

/**
 * Formats data for the select component.
 *
 * @param {CreateFormattedOptionsProps<T>} props - The properties required for formatting.
 * @param {T[]} props.data - The data to be formatted.
 * @param {CreateFormattedOptionsProps<T>['formatOptions']} props.formatOptions - The formatting options.
 * @param {string} [props.formatOptions.templateShowFormat] - The Handlebars template string for the name.
 * @param {Record<string, keyof T>} [props.formatOptions.templateValueFormat] - The Handlebars template string for the value with keys.
 *
 * @returns {Array<{name: string, value: Record<string, T[keyof T]>}>} - The formatted data.
 */
const createFormattedOptions = <T>({ data, formatOptions = {} }: CreateFormattedOptionsProps<T>) => {
	const { templateShowFormat = '', templateValueFormat = {} } = formatOptions;

	return data.map(item => {
		// Getting the formatted name from templateShowFormat.
		const formattedName = messageFormatter({
			template: templateShowFormat,
			data: item,
			options: {
				removeEmptyFields: true,
				trimWhitespace: true,
			},
		});

		// Getting formatted values by keys from templateValueFormat.
		const formattedValue = Object.keys(templateValueFormat).reduce(
			(valuesAcc, key) => {
				const fieldKey = templateValueFormat[key];

				if (item[fieldKey]) {
					valuesAcc[key] = item[fieldKey];
				} else {
					LOG_MESSAGES.WARN(`formatData: Missing key "${String(fieldKey)}" in item: ${JSON.stringify(item)}`);
				}

				return valuesAcc;
			},
			{} as Record<string, T[keyof T]>,
		);

		return {
			name: formattedName,
			value: formattedValue,
		};
	});
};

export default createFormattedOptions;
