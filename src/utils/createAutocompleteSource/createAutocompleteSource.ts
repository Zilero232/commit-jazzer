import type { IFuseOptions } from 'fuse.js';

import Fuse from 'fuse.js';

import createFormattedOptions from '@/helpers/createFormattedOptions';

interface CreateAutocompleteSourceProps<T> {
	data: T[];
	fuseOptions?: IFuseOptions<T>;
	formatOptions?: {
		templateShowFormat?: string;
		templateValueFormat?: Record<string, keyof T>;
	};
}

/**
 * Creates an autocomplete source function for searching and formatting data.
 *
 * @template T - The type of the data elements.
 * @param {CreateAutocompleteSourceProps<T>} props - The properties for creating the autocomplete source.
 * @param {T[]} props.data - The data array to search through.
 * @param {object} props.formatOptions - Options for formatting the search results.
 * @param {string} [props.formatOptions.templateShowFormat] - Template for displaying the search result.
 * @param {Record<string, keyof T>} [props.formatOptions.templateValueFormat] - Template for values in the search result.
 * @param {IFuseOptions<T>} [props.fuseOptions] - Options for Fuse.js configuration.
 *
 * @returns {Function} - A function that accepts a query string and returns formatted search results.
 */
export const createAutocompleteSource = <T>({
	data,
	formatOptions,
	fuseOptions = {
		shouldSort: true,
		threshold: 0.4,
		location: 0,
		distance: 100,
		minMatchCharLength: 1,
	},
}: CreateAutocompleteSourceProps<T>) => {
	const fuse = new Fuse(data, fuseOptions);

	return (_: unknown, query: string) => {
		if (!query) {
			// If there is no request, we return formatted data for the entire array.
			return createFormattedOptions({ data, formatOptions });
		}

		try {
			// Performing a search with filtering.
			const results = fuse.search(query);

			// Extract only data from the search results (usually this is the `item` field).
			const extractedData = results.map(result => result.item || result);

			// Return formatted data for the search results.
			return createFormattedOptions({ data: extractedData as T[], formatOptions });
		} catch (error) {
			console.error('Error during search or sorting:', error);

			// Return formatted data for the entire array.
			return createFormattedOptions({ data, formatOptions });
		}
	};
};
