import DEFAULT_COMMIT_TYPES from '@/constants/emojiCommit';

import type { CommitJazzerPrompterOptions } from '../types';

interface FilterCommitTypes {
	addCustomCommitTypes?: CommitJazzerPrompterOptions['addCustomCommitTypes'];
	availableCommitTypes?: CommitJazzerPrompterOptions['availableCommitTypes'];
	baseCommitTypes?: CommitJazzerPrompterOptions['baseCommitTypes'];
}

/**
 * Filters and customizes commit types based on provided options.
 *
 * @param {object} options - The options for filtering commit types.
 * @param {string[]} [options.availableCommitTypes] - A list of commit types that are available.
 * @param {object} [options.baseCommitTypes] - An object containing base commit types to apply modifications from.
 * @param {object} [options.addCustomCommitTypes] - An object containing custom commit types to be added.
 *
 * @returns {Array} - The filtered and customized list of commit types, including any default, modified, and custom commit types.
 */
const filterCommitTypes = ({ availableCommitTypes = [], baseCommitTypes = {}, addCustomCommitTypes = {} }: FilterCommitTypes) => {
	// Filtering the standard commit types based on the available commitTypes.
	let filteredCommitTypes = DEFAULT_COMMIT_TYPES;

	// If availableCommitTypes is not empty, filter the final list by available types.
	if (availableCommitTypes.length > 0) {
		filteredCommitTypes = filteredCommitTypes.filter(commitType => {
			if (!commitType.name) {
				return false;
			}

			return availableCommitTypes.includes(commitType.name);
		});
	}

	// Applying changes from baseCommitTypes.
	filteredCommitTypes = filteredCommitTypes.map(commitType => {
		const baseCommitType = baseCommitTypes[commitType.name as keyof typeof baseCommitTypes];

		if (baseCommitType) {
			return {
				...commitType,
				...baseCommitType,
			};
		}

		return commitType;
	});

	// Adding custom types from addCustomCommitTypes.
	const customCommitTypes = Object.keys(addCustomCommitTypes).map(key => ({
		name: key,
		...addCustomCommitTypes[key],
	}));

	// Combining standard types and custom ones.
	filteredCommitTypes = [...filteredCommitTypes, ...customCommitTypes];

	return filteredCommitTypes;
};

export default filterCommitTypes;
