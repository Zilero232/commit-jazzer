import type { BaseCommitType, CommitActionNames } from '@/types/modules/actions';

import { CommitActionsEnum } from '@/types/modules/actions';

interface CommitType extends BaseCommitType {
	/**
	 * Title of the type commit.
	 *
	 * @default "deploy"
	 */
	name: string | CommitActionNames;
}

const DEFAULT_COMMIT_TYPES: CommitType[] = [
	{ name: CommitActionsEnum.FEAT, emoji: '✨', code: ':sparkles:', description: 'Introducing new features' },
	{ name: CommitActionsEnum.FIX, emoji: '🐛', code: ':bug:', description: 'Fixing a bug' },
	{ name: CommitActionsEnum.REFACTOR, emoji: '♻️', code: ':recycle:', description: 'Refactoring code' },
	{ name: CommitActionsEnum.PERF, emoji: '⚡️', code: ':zap:', description: 'Improving performance' },
	{ name: CommitActionsEnum.CLEAN, emoji: '🧹', code: ':broom:', description: 'Cleaning up code' },
	{ name: CommitActionsEnum.SECURITY, emoji: '🔒', code: ':lock:', description: 'Fixing security issues' },
	{ name: CommitActionsEnum.DOCS, emoji: '📝', code: ':memo:', description: 'Updating documentation' },
	{ name: CommitActionsEnum.TEST, emoji: '✅', code: ':white_check_mark:', description: 'Adding or updating tests' },
	{ name: CommitActionsEnum.BUILD, emoji: '👷', code: ':construction_worker:', description: 'Updating build scripts' },
	{ name: CommitActionsEnum.REMOVE, emoji: '🔥', code: ':fire:', description: 'Removing code or files' },
	{ name: CommitActionsEnum.STYLE, emoji: '💄', code: ':lipstick:', description: 'Updating styles or UI' },
	{ name: CommitActionsEnum.CONFIG, emoji: '🔧', code: ':wrench:', description: 'Updating configuration' },
	{ name: CommitActionsEnum.UPGRADE, emoji: '⬆️', code: ':arrow_up:', description: 'Upgrading dependencies' },
	{ name: CommitActionsEnum.DOWNGRADE, emoji: '⬇️', code: ':arrow_down:', description: 'Downgrading dependencies' },
	{ name: CommitActionsEnum.I18N, emoji: '🌐', code: ':globe_with_meridians:', description: 'Localization updates' },
	{ name: CommitActionsEnum.INIT, emoji: '🎉', code: ':tada:', description: 'Initial commit' },
	{ name: CommitActionsEnum.DEPLOY, emoji: '🚀', code: ':rocket:', description: 'Deploying application' },
	{ name: CommitActionsEnum.DB, emoji: '🗃️', code: ':card_file_box:', description: 'Database changes' },
	{ name: CommitActionsEnum.UX, emoji: '🚸', code: ':children_crossing:', description: 'Improving UX/UI' },
	{ name: CommitActionsEnum.REVERT, emoji: '⏪', code: ':rewind:', description: 'Reverting changes' },
	{ name: CommitActionsEnum.BREAKING, emoji: '💥', code: ':boom:', description: 'Introducing breaking changes' },
	{ name: CommitActionsEnum.FLAG, emoji: '🚩', code: ':triangular_flag_on_post:', description: 'Feature flags updates' },
	{ name: CommitActionsEnum.A11Y, emoji: '♿️', code: ':wheelchair:', description: 'Accessibility improvements' },
	{ name: CommitActionsEnum.SEO, emoji: '🔍', code: ':mag:', description: 'SEO improvements' },
	{ name: CommitActionsEnum.ANALYTICS, emoji: '📈', code: ':chart_with_upwards_trend:', description: 'Adding analytics' },
	{ name: CommitActionsEnum.MOCK, emoji: '💾', code: ':floppy_disk:', description: 'Adding or updating mock data' },
	{ name: CommitActionsEnum.API, emoji: '🔌', code: ':electric_plug:', description: 'API updates' },
	{ name: CommitActionsEnum.PRUNE, emoji: '🗑️', code: ':wastebasket:', description: 'Removing unused dependencies' },
	{ name: CommitActionsEnum.TYPO, emoji: '✏️', code: ':pencil2:', description: 'Fixing typos' },
	{ name: CommitActionsEnum.REVIEW, emoji: '🔍️', code: ':mag_right:', description: 'Changes after code review' },
	{ name: CommitActionsEnum.EXPERIMENT, emoji: '🧪', code: ':test_tube:', description: 'Experimental code' },
	{ name: CommitActionsEnum.PKG, emoji: '📦', code: ':package:', description: 'Updating package files' },
	{ name: CommitActionsEnum.ANIMATION, emoji: '🎨', code: ':art:', description: 'Adding or updating animations' },
	{ name: CommitActionsEnum.SCRIPT, emoji: '📜', code: ':scroll:', description: 'Adding custom scripts' },
	{ name: CommitActionsEnum.STRUCT, emoji: '🏗️', code: ':building_construction:', description: 'Improving code structure' },
	{ name: CommitActionsEnum.CI, emoji: '🔄', code: ':arrows_counterclockwise:', description: 'Updating CI/CD' },
	{ name: CommitActionsEnum.LEGAL, emoji: '⚖️', code: ':balance_scale:', description: 'Legal compliance updates' },
	{ name: CommitActionsEnum.FIX_CI, emoji: '🚑', code: ':ambulance:', description: 'CI/CD fix' },
	{ name: CommitActionsEnum.MONITOR, emoji: '🔍️', code: ':mag:', description: 'Monitoring or logs update' },
	{ name: CommitActionsEnum.SUPPORT, emoji: '📞', code: ':telephone_receiver:', description: 'Adding support for feature' },
	{ name: CommitActionsEnum.TASK, emoji: '📌', code: ':pushpin:', description: 'Task management' },
	{ name: CommitActionsEnum.ARCH, emoji: '🏛️', code: ':classical_building:', description: 'Architectural changes' },
];

export default DEFAULT_COMMIT_TYPES;
