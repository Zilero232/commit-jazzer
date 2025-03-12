import type { ZodIssue } from 'zod';

interface GenerateErrorOptions {
	includeIssueCode?: boolean; // Include the error code in the message.
	maxIssues?: number; // The maximum number of errors displayed.
	prefix?: string; // Prefix for each message.
	separator?: string; // Separator between messages.
	showFieldPath?: boolean; // Show the path to the field where the error occurred.
}

interface GenerateErrorReport {
	issues: ZodIssue[];
	options?: GenerateErrorOptions;
}

/**
 * Generate a string report of validation errors for the .jazzer-cs.json file.
 *
 * @param {GenerateErrorReport} options - The options for generating the report.
 * @param {ZodIssue[]} options.issues - The validation issues to include in the report.
 * @param {GenerateErrorOptions} [options.options] - The options for customizing the report.
 * @param {string} [options.options.prefix] - The prefix to use for each error message.
 * @param {string} [options.options.separator] - The separator to use between error messages.
 *
 * @returns {string} The report of validation errors.
 */
const generateErrorReport = ({ issues, options = {} }: GenerateErrorReport): string => {
	const { prefix = '[Validation Config File]', separator = '\n', maxIssues = null, showFieldPath = true, includeIssueCode = false } = options;

	// If there are no errors, we return a message about their absence.
	if (issues.length === 0) {
		return `${prefix} - No validation issues in .jazzer-cs.json file config found.`;
	}

	const limitedIssues = maxIssues !== null ? issues.slice(0, maxIssues) : issues;

	const report = limitedIssues.reduce<string>((report, issue) => {
		const fieldPath = issue.path.join('.');

		let errorMessage = `${prefix} - Error`;

		if (includeIssueCode) {
			errorMessage += ` [${issue.code}]`;
		}

		if (showFieldPath) {
			errorMessage += ` in field (${fieldPath})`;
		}

		errorMessage += `: ${issue.message}`;

		return `${report} ${errorMessage} ${separator}`;
	}, '');

	if (maxIssues !== null && issues.length > maxIssues) {
		return `${report} ...and ${issues.length - maxIssues} more issues`;
	}

	return report;
};

export default generateErrorReport;
