/**
 * Smoke spec 5 — multi_group repeater (a Named exception: nested value shapes).
 *
 * On the showcase multi_group field: add two rows, reorder them by dragging,
 * remove one, save, reload, and assert the final persisted shape.
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
	visitShowcase,
	switchTab,
	saveOptions,
	hiddenValue,
	TABS,
} = require( './helpers/showcase' );

test.describe( 'Multi group repeater', () => {
	test( 'add, reorder, remove rows and persist', async ( { admin, page } ) => {
		await visitShowcase( admin, page );
		await switchTab( page, TABS.structure );

		const group = page.locator( '.wpifycf-field-multi-group--f_multi_group' );
		const addButton = group.locator( '.wpifycf-field-multi-group__actions button' ).first();
		const rows = group.locator( '.wpifycf-field-multi-group__item' );

		// Options state is shared across specs — start from a clean slate by
		// removing any rows a previous run persisted.
		while ( ( await rows.count() ) > 0 ) {
			await rows.first().locator( '.wpifycf-field-multi-group__remove button' ).click();
		}

		// Add two rows.
		await addButton.click();
		await addButton.click();
		await expect( rows ).toHaveCount( 2 );

		// Give each row a distinguishable title.
		await rows.nth( 0 ).locator( '.wpifycf-field-text--title' ).fill( 'Row A' );
		await rows.nth( 1 ).locator( '.wpifycf-field-text--title' ).fill( 'Row B' );

		// Reorder: drag row B (index 1) above row A (index 0).
		await dragRowOnto(
			page,
			rows.nth( 1 ).locator( '.wpifycf-field-multi-group__item-header' ),
			rows.nth( 0 ).locator( '.wpifycf-field-multi-group__item-header' )
		);

		// After reordering, the first row is now Row B.
		await expect( rows.nth( 0 ).locator( '.wpifycf-field-text--title' ) ).toHaveValue( 'Row B' );
		await expect( rows.nth( 1 ).locator( '.wpifycf-field-text--title' ) ).toHaveValue( 'Row A' );

		// Remove the second row (Row A), keeping Row B.
		await rows.nth( 1 ).locator( '.wpifycf-field-multi-group__remove button' ).click();
		await expect( rows ).toHaveCount( 1 );
		await expect( rows.nth( 0 ).locator( '.wpifycf-field-text--title' ) ).toHaveValue( 'Row B' );

		await saveOptions( page );

		// Final persisted shape: exactly one row, titled "Row B".
		const saved = JSON.parse( await hiddenValue( page, 'f_multi_group' ) );
		expect( Array.isArray( saved ) ).toBe( true );
		expect( saved ).toHaveLength( 1 );
		expect( saved[ 0 ].title ).toBe( 'Row B' );
	} );
} );

/**
 * Drag a SortableJS handle onto a target with realistic pointer movement.
 */
async function dragRowOnto( page, handle, target ) {
	const from = await handle.boundingBox();
	const to = await target.boundingBox();
	const fromX = from.x + from.width / 2;
	const fromY = from.y + from.height / 2;
	const toX = to.x + to.width / 2;
	const toY = to.y + to.height / 4;

	await page.mouse.move( fromX, fromY );
	await page.mouse.down();
	await page.mouse.move( fromX, fromY - 6, { steps: 4 } );
	await page.mouse.move( toX, toY, { steps: 12 } );
	await page.mouse.move( toX, toY - 4, { steps: 4 } );
	await page.mouse.up();
}
