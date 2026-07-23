/**
 * Smoke spec 6 — WooCommerce product variation (a Named exception: variation
 * index-suffixed input names, saved through WC's own AJAX flow).
 *
 * Create a variable product with one variation via the WC REST API, open it in
 * the admin, set a WCF field on the variation, save via WooCommerce's
 * "Save changes" AJAX, reload, and assert the value persisted.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'WooCommerce variation round trip', () => {
	test( 'persists a WCF field on a product variation', async ( { admin, page, requestUtils } ) => {
		const stamp = Date.now().toString();
		const value = `variation-${ stamp }`;

		const product = await requestUtils.rest( {
			path: '/wc/v3/products',
			method: 'POST',
			data: {
				name: `WCF Variable ${ stamp }`,
				type: 'variable',
				status: 'publish',
				attributes: [
					{ name: 'Color', visible: true, variation: true, options: [ 'Red', 'Blue' ] },
				],
			},
		} );

		await requestUtils.rest( {
			path: `/wc/v3/products/${ product.id }/variations`,
			method: 'POST',
			data: {
				regular_price: '25',
				attributes: [ { name: 'Color', option: 'Red' } ],
			},
		} );

		await openVariationsPanel( admin, page, product.id );

		const variation = page.locator( '.woocommerce_variation' ).first();
		const sampleText = variation.locator( '.wpifycf-field-text--sample_text' );
		await sampleText.scrollIntoViewIfNeeded();
		await expect( sampleText ).toBeVisible();
		await sampleText.fill( value );

		// Editing a field marks the variation dirty and enables WC's save button.
		// Nudge WC's change tracking explicitly so this never races.
		await page.evaluate( () => {
			const $ = window.jQuery;
			$( '.woocommerce_variation' ).first().addClass( 'variation-needs-update' );
			$( 'button.save-variation-changes' ).prop( 'disabled', false );
		} );

		const saveButton = page.locator( 'button.save-variation-changes' );
		await expect( saveButton ).toBeEnabled();

		// Save through WooCommerce's own variation AJAX flow.
		await Promise.all( [
			page.waitForResponse(
				( r ) =>
					r.url().includes( 'admin-ajax.php' ) &&
					( r.request().postData() || '' ).includes( 'save_variations' )
			),
			saveButton.click(),
		] );

		// Reload and assert the value round-tripped.
		await openVariationsPanel( admin, page, product.id );
		const sampleTextAfter = page
			.locator( '.woocommerce_variation .wpifycf-field-text--sample_text' )
			.first();
		await sampleTextAfter.scrollIntoViewIfNeeded();
		await expect( sampleTextAfter ).toHaveValue( value );
	} );
} );

/**
 * Open the product editor, activate the Variations tab, and expand the first
 * variation so its WCF fields mount (WCF mounts on `woocommerce_variations_loaded`).
 */
async function openVariationsPanel( admin, page, productId ) {
	await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit` );
	await page.locator( '.variations_tab a, li.variations_tab a' ).first().click();

	// Expand the first variation (its header toggles the body open).
	const header = page.locator( '.woocommerce_variation .woocommerce_variation_description, .woocommerce_variation h3' ).first();
	await header.click();

	await expect(
		page.locator( '.woocommerce_variation .wpifycf-app-instance[data-loaded="true"]' ).first()
	).toBeVisible();
}
