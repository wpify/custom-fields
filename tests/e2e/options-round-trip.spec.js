/**
 * Smoke spec 2 — options page save/reload round trip.
 *
 * Fills one representative field of each major shape (text, number, toggle,
 * async select, date), saves the options page, reloads, and asserts every
 * value persisted.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
	visitShowcase,
	switchTab,
	saveOptions,
	selectReactOption,
	setToggle,
	hiddenInput,
	hiddenValue,
	TABS,
} = require( './helpers/showcase' );

test.describe( 'Options round trip', () => {
	test( 'persists text, number, toggle, async select and date', async ( { admin, page } ) => {
		await visitShowcase( admin, page );

		const stamp = Date.now().toString();
		const textValue = `round-trip ${ stamp }`;
		const numberValue = '42';
		const dateValue = '2026-03-14';

		// Basic tab (active on load): text + number.
		await switchTab( page, TABS.basic );
		await page.locator( '.wpifycf-field-text--f_text' ).fill( textValue );
		await page.locator( '.wpifycf-field-number--f_number' ).fill( numberValue );

		// Choices tab: toggle on + async select.
		await switchTab( page, TABS.choice );
		await setToggle( page, 'f_toggle', true );
		await expect( hiddenInput( page, 'f_toggle' ) ).toHaveValue( 'true' );
		await selectReactOption( page, 'f_async', 'Async Blue' );

		// Date & time tab: date.
		await switchTab( page, TABS.datetime );
		await page.locator( '.wpifycf-field-date--f_date' ).fill( dateValue );

		await saveOptions( page );

		// Hidden submit inputs carry the persisted values regardless of tab.
		expect( await hiddenValue( page, 'f_text' ) ).toBe( textValue );
		expect( await hiddenValue( page, 'f_number' ) ).toBe( numberValue );
		expect( await hiddenValue( page, 'f_toggle' ) ).toBe( 'true' );
		expect( await hiddenValue( page, 'f_async' ) ).toBe( 'blue' );
		expect( await hiddenValue( page, 'f_date' ) ).toBe( dateValue );
	} );
} );
