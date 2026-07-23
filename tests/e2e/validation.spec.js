/**
 * Smoke spec 8 — required-field validation blocks submission.
 *
 * Clearing a required field and attempting to save must be blocked client-side:
 * the form does not navigate and a validation error is shown.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const { visitShowcase, switchTab, TABS } = require( './helpers/showcase' );

test.describe( 'Validation', () => {
	test( 'blocks save when a required field is empty', async ( { admin, page } ) => {
		await visitShowcase( admin, page );
		await switchTab( page, TABS.logic );

		// The logic tab also has a number field with a min/max range. Give it an
		// in-range value so native HTML5 constraint validation does not suppress
		// the submit event before WCF's own required-field validation runs.
		await page.locator( '.wpifycf-field-number--f_valid_num' ).fill( '15' );

		// f_required is a required text field; ensure it is empty.
		const required = page.locator( '.wpifycf-field-text--f_required' );
		await required.fill( '' );

		// Marker to detect whether the page navigated (a real save reloads it).
		await page.evaluate( () => {
			window.__wcfNoReload = true;
		} );

		await page.locator( '#submit' ).click();

		// Submission blocked: the required-field error is shown...
		await expect(
			page.locator( '.wpifycf-field__error', { hasText: 'This field is required.' } ).first()
		).toBeVisible();
		// ...the invalid control is flagged...
		await expect( page.locator( '.wpifycf-field--invalid' ).first() ).toBeVisible();

		// ...and the page did not navigate.
		expect( await page.evaluate( () => window.__wcfNoReload ) ).toBe( true );
	} );
} );
