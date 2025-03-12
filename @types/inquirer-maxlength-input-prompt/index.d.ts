import type { Answers } from 'inquirer';

import Base from 'inquirer/lib/prompts/base.js';

/**
 * Provides the functionality to create a new Inquirer plugin
 */
declare class InquirerMaxLength<T extends Answers> extends Base<T> {
	/**
	 * Render the prompt to screen
	 */
	render(error: string | undefined): void;
}

export default InquirerMaxLength;
