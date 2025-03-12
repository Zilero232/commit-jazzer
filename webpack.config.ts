import type { Configuration } from 'webpack';

import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import nodeExternals from 'webpack-node-externals';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Basic configuration for both assemblies.
const baseConfig: Configuration = {
	context: __dirname,
	entry: './src/index.ts',
	target: 'node',
	externalsPresets: { node: true },

	externals: [
		nodeExternals({
			modulesDir: path.join(__dirname, 'node_modules'),
		}),
	],

	resolve: {
		extensions: ['.ts'],
		plugins: [
			// Add support for TypeScript paths.
			new TsconfigPathsPlugin({
				configFile: './tsconfig.base.json',
			}),
		],
	},
};

// Common JS configuration.
const cjsConfig: Configuration = {
	...baseConfig,

	output: {
		filename: 'index.cjs',
		path: path.resolve(__dirname, 'build/common'),
		library: { type: 'commonjs' },
		clean: true,
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', { targets: { node: 14 } }], ['@babel/preset-typescript']],
						plugins: ['@babel/plugin-transform-modules-commonjs'],
					},
				},
			},
		],
	},
};

// ESM configuration.
const esmConfig: Configuration = {
	...baseConfig,
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'build/esm'),
		library: { type: 'module' },
		module: true,
		clean: true,
	},

	experiments: {
		outputModule: true,
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', { targets: { node: 14, esmodules: true } }], ['@babel/preset-typescript']],
					},
				},
			},
		],
	},
};

// Common plugins and optimizations for both configurations.
const pluginsAndOptimization = (isProduction: boolean, isWatchMode: boolean) => ({
	plugins: [
		// Scripts to run before the build.
		new WebpackShellPluginNext({
			onBuildStart: {
				scripts: [],
				blocking: true,
				parallel: false,
			},
			safe: true,
		}),

		// Type Checking.
		new ForkTsCheckerWebpackPlugin({
			async: false,
			typescript: {
				configFile: './tsconfig.build.json',
			},
		}),

		// Copying types.
		new CopyPlugin({
			patterns: [
				{
					from: 'src/types',
					to: '../types',
				},
			],
		}),

		...(isProduction
			? [
					// Copying static files.
					// new CopyPlugin({
					// 	patterns: [{ from: 'public', to: './' }],
					// }),
				]
			: [
					// Output of the bundle size report.
					new BundleAnalyzerPlugin({
						analyzerMode: 'static',
						openAnalyzer: false,
						reportFilename: 'bundle-report.html',
					}),
				]),

		// Output of the build progress.
		new webpack.ProgressPlugin(),
	],

	watch: isWatchMode,
});

/**
 * Export both configurations.
 *
 * @param {Record<string, unknown>} env
 * @param {import('webpack').WebpackOptionsNormalized} argv
 *
 * @returns {import('webpack').Configuration[]} - Configurations for CommonJS and ESM.
 */
export default (env: Record<string, unknown>, argv: { mode: string; watch: boolean }): Configuration[] => {
	const isProduction = argv.mode === 'production';
	const isWatchMode = argv.watch === true;

	// Combining configurations for CommonJS and ESM.
	return [
		{
			...cjsConfig,
			...pluginsAndOptimization(isProduction, isWatchMode),
		},
		{
			...esmConfig,
			...pluginsAndOptimization(isProduction, isWatchMode),
		},
	];
};
