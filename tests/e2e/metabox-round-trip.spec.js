/**
 * Smoke spec 3 — metabox save/reload round trip.
 *
 * Creates a post, fills two WCF metabox fields in the block editor, saves,
 * reloads the editor, and asserts the values persisted.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const { dismissWelcomeGuide, revealMetaBoxes } = require( './helpers/editor' );
const { selectReactOption } = require( './helpers/showcase' );

test.describe( 'Metabox round trip', () => {
	test( 'persists metabox fields on a post', async ( { admin, editor, page, requestUtils } ) => {
		const stamp = Date.now().toString();
		const post = await requestUtils.rest( {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: `WCF Metabox ${ stamp }`, status: 'draft' },
		} );

		const textValue = `meta-${ stamp }`;

		await admin.editPost( post.id );
		await dismissWelcomeGuide( page );
		await revealMetaBoxes( page );

		const sampleText = page.locator( '.wpifycf-field-text--sample_text' );
		await sampleText.scrollIntoViewIfNeeded();
		await expect( sampleText ).toBeVisible();
		await sampleText.fill( textValue );

		await selectReactOption( page, 'sample_select', 'Green' );

		// Saving a draft also submits the meta boxes.
		await editor.saveDraft();

		// Reload the editor and assert persistence.
		await admin.editPost( post.id );
		await dismissWelcomeGuide( page );
		await revealMetaBoxes( page );

		const sampleTextAfter = page.locator( '.wpifycf-field-text--sample_text' );
		await sampleTextAfter.scrollIntoViewIfNeeded();
		await expect( sampleTextAfter ).toHaveValue( textValue );
		await expect(
			page.locator( '.wpifycf-field-select--sample_select .wpifycf-select__single-value' )
		).toHaveText( 'Green' );
	} );
} );
