/**
 * Playwright global setup.
 *
 * Logs in as the admin once, stores the authenticated cookies + REST nonce
 * (so every spec starts authenticated), activates the plugin and the demo
 * fixture, and sets pretty permalinks for the REST-driven flows.
 *
 * The plugin (".") and the demo fixture (tests/fixtures/wcf-demo) are mounted
 * into wp-content/plugins via .wp-env.json `mappings`, which mount but do NOT
 * activate — hence the explicit activation here. WooCommerce is listed in
 * .wp-env.json `plugins`, so wp-env activates it on start.
 */
const { request } = require( '@playwright/test' );
const { RequestUtils } = require( '@wordpress/e2e-test-utils-playwright' );

async function globalSetup( config ) {
	const { storageState, baseURL } = config.projects[ 0 ].use;
	const storageStatePath =
		typeof storageState === 'string' ? storageState : undefined;

	const user = {
		username: process.env.WP_USERNAME || 'admin',
		password: process.env.WP_PASSWORD || 'password',
	};

	const requestContext = await request.newContext( { baseURL } );
	const requestUtils = new RequestUtils( requestContext, {
		user,
		storageStatePath,
	} );

	// Authenticate and persist the storage state consumed by every spec.
	await requestUtils.setupRest();

	// Activate the mapped plugins via the core plugins REST endpoint (robust to
	// the demo's `Requires Plugins` header, unlike the UI-based helper). WCF must
	// come first — the demo declares it as a required plugin. Tolerate a plugin
	// that is already active (e.g. repeated local runs, or the DDEV target).
	const pluginFiles = [
		'wpify-custom-fields/custom-fields',
		'wcf-demo/wcf-demo',
	];
	for ( const plugin of pluginFiles ) {
		try {
			await requestUtils.rest( {
				path: `/wp/v2/plugins/${ plugin }`,
				method: 'POST',
				data: { status: 'active' },
			} );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn(
				`[global-setup] activate "${ plugin }" skipped: ${ error.message }`
			);
		}
	}

	// Pretty permalinks so /wp-json REST routes resolve for the editor and the
	// WooCommerce REST calls used by the specs.
	try {
		await requestUtils.rest( {
			path: '/wp/v2/settings',
			method: 'POST',
			data: { permalink_structure: '/%postname%/' },
		} );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn(
			`[global-setup] could not set permalinks: ${ error.message }`
		);
	}

	await requestContext.dispose();
}

module.exports = globalSetup;
