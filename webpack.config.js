const path = require('path');
const fs = require('fs');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const globImporter = require('node-sass-glob-importer');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

/**
 * Resolves paths to absolute paths recursively. The input can be a string, an array, or an object containing paths.
 * If the input is a string, it will resolve the single path.
 * If the input is an array, it will resolve all paths within the array.
 * If the input is an object, it will resolve all paths within the object, maintaining the same keys.
 *
 * @param {string|string[]|Object.<string, string>} paths - The path or paths to resolve.
 * @returns {string|string[]|Object.<string, string>} The absolute path or paths.
 */
function resolvePathsRecursively(paths) {
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
}

/**
 * Finds the first file that matches the given pattern inside the .ddev folder,
 * starting from the current working directory and traversing up the directory tree.
 * The pattern can include a wildcard, such as 'traefik/certs/*.key'.
 *
 * @param {string} pattern - The relative path pattern to the target file inside the .ddev folder.
 * @returns {string|null} The absolute path to the first file that matches the pattern, or null if no matching file is found.
 */
function findDdevFile(pattern) {
	// Start from the current working directory
	let currentDir = process.cwd();

	// Separate pattern into directory and file part
	const patternDir = path.dirname(pattern);
	const patternFile = path.basename(pattern);
	const isWildcard = patternFile.includes('*');

	// Traverse up the directory tree to find the .ddev folder
	while (currentDir !== path.dirname(currentDir)) {
		const ddevPath = path.join(currentDir, '.ddev', patternDir);

		// Check if the target directory exists inside the .ddev folder
		if (fs.existsSync(ddevPath)) {
			const files = fs.readdirSync(ddevPath);

			// If wildcard, find the first matching file
			if (isWildcard) {
				const regex = new RegExp(`^${patternFile.replace('*', '.*')}$`);
				const matchingFile = files.find((file) => regex.test(file));

				if (matchingFile) {
					return path.join(ddevPath, matchingFile);
				}
			} else if (files.includes(patternFile)) {
				// If not wildcard, return the exact file if it exists
				return path.join(ddevPath, patternFile);
			}
		}

		// Move up to the parent directory
		currentDir = path.dirname(currentDir);
	}

	// If the target file is not found, return null
	return null;
}

module.exports = (env) => {
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

	const key = findDdevFile('traefik/certs/*.key');
	const cert = findDdevFile('traefik/certs/*.crt');

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
				https: { key, cert },
			}, {
				injectCss: true,
				reload: true
			}),
		].filter(Boolean),
	};
};
