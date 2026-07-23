/**
 * Helpers for the block editor surfaces (metabox + Gutenberg block specs).
 */

/**
 * Dismiss the block editor "Welcome" modal, which otherwise overlays the canvas
 * and blocks interaction. Setting the preference closes it reactively.
 *
 * @param {import('@playwright/test').Page} page
 */
async function dismissWelcomeGuide( page ) {
	await page
		.evaluate( () => {
			const prefs = window.wp?.data?.dispatch( 'core/preferences' );
			if ( prefs ) {
				prefs.set( 'core/edit-post', 'welcomeGuide', false );
				prefs.set( 'core', 'welcomeGuide', false );
			}
		} )
		.catch( () => {} );
}

/**
 * Reveal the classic meta-boxes area, which the block editor renders with
 * `display:none` (WP 6.9+). Injected as an `!important` rule so it survives the
 * editor's re-renders, unlike an inline style.
 *
 * @param {import('@playwright/test').Page} page
 */
async function revealMetaBoxes( page ) {
	await page.addStyleTag( {
		content:
			'.edit-post-meta-boxes-main__liner,.edit-post-layout__metaboxes' +
			'{display:block !important;height:auto !important;overflow:visible !important;}',
	} );
}

module.exports = { dismissWelcomeGuide, revealMetaBoxes };
