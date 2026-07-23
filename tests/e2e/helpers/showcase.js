/**
 * Shared helpers for driving the WCF Demo showcase options page and the
 * WPify Custom Fields React UI in general.
 */
const { expect } = require( '@wordpress/e2e-test-utils-playwright' );

// The showcase options page registered by the wcf-demo fixture.
const SHOWCASE_OPTION = 'wcf_demo_showcase';
const SHOWCASE_QUERY = 'page=wcf-demo';

// Showcase tab labels, keyed by the tab id used in the fixture.
const TABS = {
	basic: 'Basic inputs',
	choice: 'Choices',
	datetime: 'Date & time',
	rich: 'Rich & visual',
	media: 'Media',
	relations: 'Relations',
	multi: 'Repeaters',
	structure: 'Structure',
	special: 'Special',
	logic: 'Conditions & validation',
};

/**
 * Navigate to the showcase options page and wait for the React app to mount.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Admin} admin
 * @param {import('@playwright/test').Page}                      page
 */
async function visitShowcase( admin, page ) {
	await admin.visitAdminPage( 'admin.php', SHOWCASE_QUERY );
	await expectAppReady( page );
}

/**
 * Wait until a WPify Custom Fields app instance has finished mounting.
 *
 * @param {import('@playwright/test').Page} page
 */
async function expectAppReady( page ) {
	await expect(
		page.locator( '.wpifycf-app-instance[data-loaded="true"]' ).first()
	).toBeVisible();
}

/**
 * Click a showcase tab (by its visible label) and wait for it to activate.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string}                          label
 */
async function switchTab( page, label ) {
	const tab = page.locator(
		'.wpifycf-app-instance nav.nav-tab-wrapper button.nav-tab',
		{ hasText: label }
	);
	await tab.click();
	await expect( tab ).toHaveClass( /nav-tab-active/ );
}

/**
 * The hidden `<input>` that carries a showcase field's submitted value.
 * This exists whether or not the field's tab is currently active.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string}                          fieldId
 * @param {string}                          [option]
 */
function hiddenInput( page, fieldId, option = SHOWCASE_OPTION ) {
	return page.locator( `input[name="${ option }[${ fieldId }]"]` );
}

/**
 * Read a showcase field's submitted value from its hidden input.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string}                          fieldId
 * @param {string}                          [option]
 */
async function hiddenValue( page, fieldId, option = SHOWCASE_OPTION ) {
	return hiddenInput( page, fieldId, option ).inputValue();
}

/**
 * Choose an option in a react-select based field (static or async). The menu
 * is portalled to document.body, so options are matched globally by text.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string}                          fieldId       Field id (e.g. f_async).
 * @param {string}                          optionLabel   Visible option text.
 */
async function selectReactOption( page, fieldId, optionLabel ) {
	await page.locator( `.wpifycf-field-select--${ fieldId } .wpifycf-select__control` ).click();
	const option = page
		.locator( '.wpifycf-select__option', { hasText: optionLabel } )
		.first();
	await option.click();
}

/**
 * Set a toggle field to a desired on/off state (idempotent — options state is
 * shared across specs, so blind flipping is not safe). WP ToggleControl renders
 * a checkbox inside the field wrapper; its `id` is not reliably forwarded, so it
 * is targeted by class.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string}                          fieldId
 * @param {boolean}                         desired
 */
async function setToggle( page, fieldId, desired ) {
	const checkbox = page.locator(
		`.wpifycf-field-toggle--${ fieldId } input[type="checkbox"]`
	);
	if ( ( await checkbox.isChecked() ) !== desired ) {
		await checkbox.click( { force: true } );
	}
}

/**
 * Save the options page and wait for the post-save reload to re-mount the app.
 *
 * @param {import('@playwright/test').Page} page
 */
async function saveOptions( page ) {
	// Mark the pre-save document; the marker vanishing proves the form
	// submission actually navigated (waitForURL alone would match the
	// current URL and could resolve before the reload).
	await page.evaluate( () => {
		window.__wcfPreSaveDocument = true;
	} );
	await page.locator( '#submit' ).click();
	await page.waitForFunction( () => ! window.__wcfPreSaveDocument );
	await page.waitForLoadState( 'load' );
	await expectAppReady( page );
}

module.exports = {
	SHOWCASE_OPTION,
	SHOWCASE_QUERY,
	TABS,
	visitShowcase,
	expectAppReady,
	switchTab,
	hiddenInput,
	hiddenValue,
	selectReactOption,
	setToggle,
	saveOptions,
};
