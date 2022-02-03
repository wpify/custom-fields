const path = require('path');
const fs = require('fs');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const globImporter = require('node-sass-glob-importer');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = (env) => {
	const resolvePathsRecursively = (paths) => {
		if (typeof paths === 'string') {
			return path.resolve(__dirname, paths);
		} else if (Array.isArray(paths)) {
			return paths.map(resolvePathsRecursively);
		} else if (Object(paths) === paths) {
			const resolvedPaths = {};

			Object.keys(paths).forEach(key => {
				resolvedPaths[key] = resolvePathsRecursively(paths[key]);
			});

			return resolvedPaths;
		}
	};

	const config = {
		entry: {
			'wpify-custom-fields': [
				'./assets/wpify-custom-fields.js',
				'./assets/wpify-custom-fields.scss',
			],
			'wpify-custom-blocks': [
				'./assets/wpify-custom-blocks.js',
				'./assets/wpify-custom-fields.scss',
			],
		},
		output: {
			path: 'build',
			filename: '[name].[contenthash:16].js',
			chunkFilename: '[name].[chunkhash:16].js',
		},
		browsersync: {
			files: [
				'build/**/*.css',
				'build/**/*.js',
				'build/**/*.svg',
				'src/**/*.php',
			],
		},
	};

	return {
		...defaultConfig,
		entry: resolvePathsRecursively(config.entry),
		output: {
			...defaultConfig.output,
			path: resolvePathsRecursively(config.output.path),
		},
		resolve: {
			...defaultConfig.resolve,
			...config.resolve,
			extensions: ['.js', '.json', '.jsx'],
		},
		module: {
			...defaultConfig.module,
			rules: [
				...defaultConfig.module.rules.map((rule) => {
					if (rule.test.test('.scss')) {
						rule.use.forEach(use => {
							if (use.loader === require.resolve('sass-loader')) {
								use.options.sassOptions = {
									...(use.options.sassOptions || null),
									importer: globImporter(),
								};
							}
						});
					}

					return rule;
				}),
			],
		},
		plugins: [
			...defaultConfig.plugins,
			env.WEBPACK_WATCH && config.browsersync && new BrowserSyncPlugin({
				...config.browsersync,
				...(
					fs.existsSync(resolvePathsRecursively('.ssl/certs/master.key')) && fs.existsSync(resolvePathsRecursively('.ssl/certs/master.crt'))
						? {
							https: resolvePathsRecursively({
								key: '.ssl/certs/master.key',
								cert: '.ssl/certs/master.crt',
							})
						}
						: {}
				),
			}, {
				injectCss: true,
				reload: true
			}),
		].filter(Boolean),
	};
}
