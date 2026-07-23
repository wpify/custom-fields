/**
 * Smoke spec 4 — Gutenberg block (a Named exception: controlled state, a
 * different data path than form submission).
 *
 * Insert the WCF Demo Block, edit a field attribute, confirm the server-side
 * preview reflects it, save, reload the editor, and assert it persisted.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const { dismissWelcomeGuide } = require( './helpers/editor' );

test.describe( 'Gutenberg block', () => {
	test( 'edits an attribute, previews and persists it', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		const stamp = Date.now().toString();
		const value = `block-${ stamp }`;
		const post = await requestUtils.rest( {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: `WCF Block ${ stamp }`, status: 'draft' },
		} );

		await admin.editPost( post.id );
		await dismissWelcomeGuide( page );

		await editor.insertBlock( { name: 'wcf-demo/showcase' } );

		// The block mounts in server-rendered "View" mode; switch to "Edit".
		await clickBlockToolbarButton( page, 'Edit' );

		const sampleText = editor.canvas.locator( '.wpifycf-field-text--sample_text' );
		await expect( sampleText ).toBeVisible();
		await sampleText.fill( value );

		// Switch back to the server-rendered view; the preview must reflect it.
		await clickBlockToolbarButton( page, 'View' );
		await expect( editor.canvas.locator( '.wcf-demo-block' ) ).toContainText( value );

		await editor.saveDraft();

		// Reload the editor: the saved attribute round-trips into the server render.
		await admin.editPost( post.id );
		await dismissWelcomeGuide( page );
		await expect( editor.canvas.locator( '.wcf-demo-block' ) ).toContainText( value );
	} );
} );

/**
 * Click a button in the selected block's toolbar by its accessible name.
 */
async function clickBlockToolbarButton( page, name ) {
	const toolbar = page.getByRole( 'toolbar', { name: /block tools/i } );
	await toolbar.getByRole( 'button', { name, exact: true } ).click();
}
