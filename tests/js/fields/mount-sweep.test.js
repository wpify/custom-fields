// Mount-sweep: mount EVERY registered field type through the real App tree with
// a minimal definition and assert it renders without throwing. Iterating over
// the live fields registry guarantees new field types are covered automatically
// (an uncovered type would need an explicit SKIP entry below).
//
// Heavy browser-only engines (CodeMirror, Lexical, Leaflet, the phone input,
// the block editor) are mocked at the module boundary — see tests/js/__mocks__.
import '@testing-library/jest-dom';
import fieldTypes from '@/fields';
import { renderApp } from '../support/providers';

// Per-type extra definition props needed to mount meaningfully (items for
// containers, options for choice fields). Types not listed mount with the base.
const OVERRIDES = {
	group: { items: [ { id: 'child', type: 'text' } ], value: { child: '' } },
	multi_group: { items: [ { id: 'child', type: 'text' } ], value: [] },
	columns: { items: [ { id: 'child', type: 'text' } ] },
	wrapper: { items: [ { id: 'child', type: 'text' } ] },
	select: { options: [ { value: 'a', label: 'A' } ], value: '' },
	multi_select: { options: [ { value: 'a', label: 'A' } ], value: [] },
	radio: { options: [ { value: 'a', label: 'A' } ], value: '' },
	checkbox: { value: false },
	multi_checkbox: { options: [ { value: 'a', label: 'A' } ], value: {} },
	toggle: { value: false },
	multi_toggle: { options: [ { value: 'a', label: 'A' } ], value: {} },
	link: { value: {} },
	multi_link: { value: [] },
	number: { value: 0 },
	range: { value: 0 },
	cloudflare: { value: {} },
	mapycz: { value: {} },
	multi_mapycz: { value: [] },
};

// Types deliberately excluded from the sweep, with justification. Empty today:
// every registered type mounts in jsdom via the boundary mocks.
const SKIP = {};

const allTypes = Object.keys( fieldTypes );

// A stable seed value per type. Production's prepare_items_for_js() always hands
// a field a concrete value of the right shape; multi_* fields in particular
// receive an array (a stable reference in AppContext state). Passing a value
// mirrors that contract — without it a multi_* field falls back to a fresh `[]`
// default on every render, which its collapse-tracking effect turns into a
// render loop that never occurs in production.
function seedValue( type ) {
	const override = OVERRIDES[ type ];
	if ( override && 'value' in override ) {
		return override.value;
	}
	if ( type.startsWith( 'multi_' ) ) {
		return [];
	}
	return '';
}

describe( 'field mount-sweep', () => {
	it( 'covers every registered field type (guards against gaps)', () => {
		// Sanity: the registry is non-trivial and the sweep table below iterates
		// the same live list, so coverage can't silently drop a type.
		expect( allTypes.length ).toBeGreaterThan( 50 );
	} );

	const sweepTypes = allTypes.filter( ( type ) => ! ( type in SKIP ) );

	it.each( sweepTypes )( 'mounts "%s" without throwing', ( type ) => {
		const override = OVERRIDES[ type ] || {};
		const field = {
			id: `field_${ type }`,
			type,
			label: `Test ${ type }`,
			...override,
			value: seedValue( type ),
		};

		const { container, unmount } = renderApp( { fields: [ field ] } );

		expect( container.querySelector( '.wpifycf-app-instance__fields' ) ).toBeInTheDocument();
		unmount();
	} );

	const skipEntries = Object.entries( SKIP );
	if ( skipEntries.length > 0 ) {
		it.each( skipEntries )( 'skips "%s": %s', () => {
			// Placeholder so skipped types remain visible in test output.
		} );
	}
} );
