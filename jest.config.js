/**
 * Jest configuration for the JS unit test layer.
 *
 * Extends the @wordpress/scripts default (which itself extends
 * @wordpress/jest-preset-default: jsdom env, SCSS/CSS mocks, babel transform)
 * and layers on:
 *   - the `@` → assets/ webpack alias used throughout the source,
 *   - static-asset (svg/png/...) stubs,
 *   - module-boundary mocks for heavy browser-only libraries (CodeMirror,
 *     Leaflet, Lexical, the phone input) that don't belong in a jsdom smoke
 *     test — their real behaviour is covered by the E2E layer,
 *   - jsdom globals the source relies on (IntersectionObserver, matchMedia,
 *     the `wp.*` runtime, ...).
 */
const defaultConfig = require( '@wordpress/scripts/config/jest-unit.config.js' );

const mocksDir = '<rootDir>/tests/js/__mocks__';

module.exports = {
	...defaultConfig,
	rootDir: __dirname,
	testMatch: [ '<rootDir>/tests/js/**/*.test.js' ],
	// A few dependencies ship ESM-only; let babel-jest transform them instead of
	// ignoring them like the rest of node_modules.
	transformIgnorePatterns: [
		'/node_modules/(?!(@uidotdev)/)',
		'\\.pnp\\.[^\\/]+$',
	],
	setupFilesAfterEnv: [ '<rootDir>/tests/js/setup.js' ],
	moduleNameMapper: {
		...( defaultConfig.moduleNameMapper || {} ),
		// WordPress-provided packages not installed locally (runtime `wp.*`).
		'^@wordpress/core-data$': `${ mocksDir }/empty.js`,
		// Block editor: heavy, partly-ESM tree used only by the InnerBlocks field.
		'^@wordpress/block-editor$': `${ mocksDir }/wp-block-editor.js`,
		// Static assets imported by field components (e.g. placeholder images).
		'\\.(svg|png|jpe?g|gif|webp)$': `${ mocksDir }/fileMock.js`,
		// Heavy browser-only libraries — mocked at the package boundary.
		'^@uiw/react-codemirror$': `${ mocksDir }/codemirror.js`,
		'^@uiw/codemirror-theme-vscode$': `${ mocksDir }/codemirror-empty.js`,
		'^@codemirror/': `${ mocksDir }/codemirror-empty.js`,
		'^react-leaflet$': `${ mocksDir }/react-leaflet.js`,
		'^@react-leaflet/core$': `${ mocksDir }/react-leaflet.js`,
		'^leaflet$': `${ mocksDir }/leaflet.js`,
		'^react-phone-number-input$': `${ mocksDir }/phone-input.js`,
		'^lexical$': `${ mocksDir }/lexical.js`,
		'^@lexical/': `${ mocksDir }/lexical.js`,
		// The `@` webpack alias. Keep last so the specific rules above win.
		'^@/(.*)$': '<rootDir>/assets/$1',
	},
};
