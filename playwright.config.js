/**
 * Playwright configuration for the WPify Custom Fields E2E Smoke set.
 *
 * The canonical environment is wp-env (see .wp-env.json), served at
 * http://localhost:8889. Point the suite at any other WordPress install
 * (e.g. the DDEV dev site) by exporting WP_BASE_URL, and override the admin
 * credentials with WP_USERNAME / WP_PASSWORD (DDEV uses admin / admin;
 * wp-env defaults to admin / password).
 */
const path = require( 'path' );
const { defineConfig, devices } = require( '@playwright/test' );

process.env.WP_ARTIFACTS_PATH =
	process.env.WP_ARTIFACTS_PATH || path.join( __dirname, 'tests/e2e/artifacts' );
process.env.STORAGE_STATE_PATH =
	process.env.STORAGE_STATE_PATH ||
	path.join( process.env.WP_ARTIFACTS_PATH, 'storage-states/admin.json' );

const baseURL = process.env.WP_BASE_URL || 'http://localhost:8889';

module.exports = defineConfig( {
	testDir: path.join( __dirname, 'tests/e2e' ),
	globalSetup: require.resolve( './tests/e2e/config/global-setup.js' ),
	outputDir: path.join( process.env.WP_ARTIFACTS_PATH, 'test-results' ),

	// The specs mutate shared site state (options, a product, a post); run them
	// serially in a single worker so they never race each other.
	fullyParallel: false,
	workers: 1,

	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 2 : 0,
	timeout: 90_000,
	expect: { timeout: 15_000 },

	reporter: process.env.CI
		? [
				[ 'github' ],
				[
					'html',
					{
						open: 'never',
						outputFolder: path.join(
							process.env.WP_ARTIFACTS_PATH,
							'playwright-report'
						),
					},
				],
		  ]
		: [
				[ 'list' ],
				[
					'html',
					{
						open: 'never',
						outputFolder: path.join(
							process.env.WP_ARTIFACTS_PATH,
							'playwright-report'
						),
					},
				],
		  ],

	use: {
		baseURL,
		storageState: process.env.STORAGE_STATE_PATH,
		actionTimeout: 15_000,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'off',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ] },
		},
	],
} );
