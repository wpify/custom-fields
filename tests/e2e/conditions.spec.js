/**
 * Smoke spec 7 — conditional visibility and the data-hide-field contract.
 *
 * A controlling toggle shows/hides a dependent field. When hidden, the field's
 * value must still be submitted (rendered as a hidden input carrying
 * data-hide-field="true"), so it survives a save/reload.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
	visitShowcase,
	switchTab,
	saveOptions,
	setToggle,
	hiddenInput,
	TABS,
} = require( './helpers/showcase' );

test.describe( 'Conditional fields', () => {
	test( 'hidden dependent field still submits its value', async ( { admin, page } ) => {
		await visitShowcase( admin, page );
		await switchTab( page, TABS.logic );

		const target = hiddenInput( page, 'f_cond_target' );
		const control = page.locator( '.wpifycf-field-text--f_cond_target' );

		// Controlling toggle off -> target hidden (only the hidden input renders).
		await setToggle( page, 'f_cond_toggle', false );
		await expect( target ).toHaveAttribute( 'data-hide-field', 'true' );
		await expect( control ).toHaveCount( 0 );

		// Toggle on -> target becomes visible.
		await setToggle( page, 'f_cond_toggle', true );
		await expect( target ).toHaveAttribute( 'data-hide-field', 'false' );
		await expect( control ).toBeVisible();

		const secret = `secret-${ Date.now() }`;
		await control.fill( secret );

		// Toggle back off -> hidden again, but the hidden input keeps the value.
		await setToggle( page, 'f_cond_toggle', false );
		await expect( target ).toHaveAttribute( 'data-hide-field', 'true' );
		await expect( control ).toHaveCount( 0 );
		await expect( target ).toHaveValue( secret );

		// Save from the Basic tab: the Logic tab has empty required fields and an
		// out-of-range number that would block submission — unrelated to this test.
		// The hidden f_cond_target input still submits regardless of active tab.
		await switchTab( page, TABS.basic );
		await saveOptions( page );

		// After reload the toggle is off (saved false) so the target stays hidden,
		// yet its value was submitted and persisted.
		await switchTab( page, TABS.logic );
		const targetAfter = hiddenInput( page, 'f_cond_target' );
		await expect( targetAfter ).toHaveAttribute( 'data-hide-field', 'true' );
		await expect( targetAfter ).toHaveValue( secret );
	} );
} );
