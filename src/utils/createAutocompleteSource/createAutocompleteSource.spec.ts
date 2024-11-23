import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import Fuse from 'fuse.js';

import createFormattedOptions from '@/helpers/createFormattedOptions';

import { createAutocompleteSource } from './createAutocompleteSource';

vi.mock('@/helpers/createFormattedOptions', () => ({
	default: vi.fn(),
}));

vi.mock('fuse.js', () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			search: vi.fn(),
		})),
	};
});

describe('createAutocompleteSource', () => {
	const mockCreateFormattedOptions = createFormattedOptions as Mock;

	const data = [
		{ id: 1, name: 'Alice' },
		{ id: 2, name: 'Bob' },
		{ id: 3, name: 'Charlie' },
	];

	const formatOptions = { templateShowFormat: '{{name}}' };

	it('should return formatted data for the entire array when query is empty', () => {
		mockCreateFormattedOptions.mockReturnValue(data);

		const autocompleteSource = createAutocompleteSource({
			data,
			keys: ['name'],
			formatOptions,
		});

		const result = autocompleteSource(undefined, '');

		expect(result).toEqual(data);
		expect(createFormattedOptions).toHaveBeenCalledWith({ data, formatOptions });
	});

	it('should return formatted results when query is non-empty', () => {
		mockCreateFormattedOptions.mockReturnValue([{ id: 2, name: 'Bob' }]);

		const mockFuseSearch = vi.fn().mockReturnValue([{ item: { id: 2, name: 'Bob' } }]);

		(Fuse as unknown as Mock).mockImplementationOnce(() => ({
			search: mockFuseSearch,
		}));

		const autocompleteSource = createAutocompleteSource({
			data,
			keys: ['name'],
			formatOptions,
		});

		const result = autocompleteSource(undefined, 'Bob');

		expect(result).toEqual([{ id: 2, name: 'Bob' }]);
		expect(mockFuseSearch).toHaveBeenCalledWith('Bob');
		expect(mockCreateFormattedOptions).toHaveBeenCalledWith({
			data: [{ item: { id: 2, name: 'Bob' } }],
			formatOptions,
		});
	});

	it('should return formatted data when search fails', () => {
		mockCreateFormattedOptions.mockReturnValue(data);
		const consoleErrorMock = vi.spyOn(console, 'error').mockImplementationOnce(() => {});

		const mockFuseSearch = vi.fn().mockImplementation(() => {
			throw new Error('Search failed');
		});

		(Fuse as unknown as Mock).mockImplementationOnce(() => ({
			search: mockFuseSearch,
		}));

		const autocompleteSource = createAutocompleteSource({
			data,
			keys: ['name'],
			formatOptions,
		});

		const result = autocompleteSource(undefined, 'Nonexistent');

		expect(result).toEqual(data);
		expect(mockFuseSearch).toHaveBeenCalledWith('Nonexistent');
		expect(mockCreateFormattedOptions).toHaveBeenCalledWith({ data, formatOptions });
		expect(consoleErrorMock).toHaveBeenCalledWith('Error during search or sorting:', expect.any(Error));

		consoleErrorMock.mockRestore();
	});
});
