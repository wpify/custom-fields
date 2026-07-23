/**
 * Smoke spec 1 — the whole field-type catalogue mounts cleanly.
 *
 * Opens the wcf-demo showcase options page (which registers every field type),
 * cycles through all ten tabs so every component actually mounts, and asserts
 * that a broad set of distinct field types rendered with ZERO uncaught
 * exceptions and ZERO console errors.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const { visitShowcase, expectAppReady, switchTab, TABS } = require( './helpers/showcase' );

// Console noise that is unrelated to the plugin and safe to ignore.
const IGNORED_CONSOLE = [
	/favicon/i,
	/Failed to load resource: the server responded with a status of 404/i,
	/ResizeObserver loop/i,
	/Content-Security-Policy/i,
	/was preloaded using link preload but not used/i,
];

test.describe( 'All field types render', () => {
	test( 'every tab mounts with no console errors', async ( { admin, page } ) => {
		const consoleErrors = [];
		const pageErrors = [];

		page.on( 'console', ( msg ) => {
			if ( msg.type() !== 'error' ) {
				return;
			}
			const text = msg.text();
			if ( IGNORED_CONSOLE.some( ( re ) => re.test( text ) ) ) {
				return;
			}
			consoleErrors.push( text );
		} );
		page.on( 'pageerror', ( error ) => pageErrors.push( error.message ) );

		await visitShowcase( admin, page );

		// Union of every `wpifycf-field--<type>` modifier class seen across tabs.
		const seenTypes = new Set();

		async function collectTypes() {
			const types = await page.evaluate( () => {
				const found = new Set();
				document.querySelectorAll( '[class*="wpifycf-field--"]' ).forEach( ( el ) => {
					el.classList.forEach( ( cls ) => {
						if ( cls.startsWith( 'wpifycf-field--' ) ) {
							found.add( cls.replace( 'wpifycf-field--', '' ) );
						}
					} );
				} );
				return [ ...found ];
			} );
			types.forEach( ( t ) => seenTypes.add( t ) );
		}

		const tabLabels = Object.values( TABS );

		// The first tab is already active on load.
		await expect(
			page.locator( '.wpifycf-app-instance nav.nav-tab-wrapper button.nav-tab' )
		).toHaveCount( tabLabels.length );
		await collectTypes();

		for ( const label of tabLabels ) {
			await switchTab( page, label );
			await expectAppReady( page );
			// At least one editable control is present on every tab.
			await expect(
				page.locator( '.wpifycf-app-instance .wpifycf-field__control' ).first()
			).toBeVisible();
			await collectTypes();
		}

		// A large, diverse set of field types mounted (the showcase has 59; many
		// share a base component and some are display-only, so we assert a robust
		// floor rather than an exact count).
		expect( seenTypes.size ).toBeGreaterThanOrEqual( 25 );

		// Core representative types must be among them.
		for ( const type of [ 'text', 'number', 'select', 'toggle', 'date', 'color' ] ) {
			expect( seenTypes ).toContain( type );
		}

		expect( pageErrors, `Uncaught page errors:\n${ pageErrors.join( '\n' ) }` ).toEqual( [] );
		expect( consoleErrors, `Console errors:\n${ consoleErrors.join( '\n' ) }` ).toEqual( [] );
	} );
} );
