// Define commit type action.
export enum CommitActionsEnum {
	FEAT = 'feat',
	FIX = 'fix',
	REFACTOR = 'refactor',
	PERF = 'perf',
	CLEAN = 'clean',
	SECURITY = 'security',
	DOCS = 'docs',
	TEST = 'test',
	BUILD = 'build',
	REMOVE = 'remove',
	STYLE = 'style',
	CONFIG = 'config',
	UPGRADE = 'upgrade',
	DOWNGRADE = 'downgrade',
	I18N = 'i18n',
	INIT = 'init',
	DEPLOY = 'deploy',
	DB = 'db',
	UX = 'ux',
	REVERT = 'revert',
	BREAKING = 'breaking',
	FLAG = 'flag',
	A11Y = 'a11y',
	SEO = 'seo',
	ANALYTICS = 'analytics',
	MOCK = 'mock',
	API = 'api',
	PRUNE = 'prune',
	TYPO = 'typo',
	REVIEW = 'review',
	EXPERIMENT = 'experiment',
	PKG = 'pkg',
	ANIMATION = 'animation',
	SCRIPT = 'script',
	STRUCT = 'struct',
	CI = 'ci',
	LEGAL = 'legal',
	FIX_CI = 'fix-ci',
	MONITOR = 'monitor',
	SUPPORT = 'support',
	TASK = 'task',
	ARCH = 'arch',
}

// Define base commit type.
export interface BaseCommitType {
	/**
	 * Code of the emoji.
	 *
	 * @default ":rocket:"
	 */
	code: string;

	/**
	 * Description of the type commit.
	 *
	 * @default "Deploying application"
	 */
	description: string;

	/**
	 * Emoji of the type commit.
	 *
	 * @default "🚀"
	 */
	emoji: string;
}

// Define commit type names.
export type CommitActionNames = `${CommitActionsEnum}`;
