import userEvent from '@testing-library/user-event';
import { validate } from 'uuid';
import { renderApp } from '../support/providers';
import '@/helpers/generators';

it( 'regenerates UUIDs when duplicating a group while preserving its other values', async () => {
	const user = userEvent.setup();
	const original = { uid: 'original-uuid', title: 'Keep me' };
	const { container } = renderApp( {
		fields: [ {
			id: 'groups', name: 'groups', type: 'multi_group', value: [ original ],
			items: [
				{ id: 'uid', type: 'hidden', generator: 'uuid' },
				{ id: 'title', type: 'text' },
			],
		} ],
	} );

	await user.click( container.querySelector( '.wpifycf-field-multi-group__duplicate button' ) );
	const rows = JSON.parse( container.querySelector( 'input[name="groups"]' ).value );
	expect( rows ).toHaveLength( 2 );
	expect( rows.filter( row => row.uid === original.uid ) ).toHaveLength( 1 );
	const copy = rows.find( row => row.uid !== original.uid );
	expect( validate( copy.uid ) ).toBe( true );
	expect( copy.title ).toBe( original.title );
} );

it( 'regenerates nested and wrapped UUIDs on every duplicate without changing the source', async () => {
	const user = userEvent.setup();
	const original = {
		uid: 'wrapped-uuid',
		details: { uid: 'nested-uuid', title: 'Nested title' },
		children: [ { uid: 'child-one' }, { uid: 'child-two' } ],
	};
	const { container } = renderApp( {
		fields: [ {
			id: 'groups', name: 'groups', type: 'multi_group', value: [ original ],
			items: [
				{ id: 'layout', type: 'wrapper', items: [
					{ id: 'columns', type: 'columns', items: [ { id: 'uid', type: 'hidden', generator: 'uuid' } ] },
				] },
				{ id: 'details', type: 'group', items: [
					{ id: 'uid', type: 'hidden', generator: 'uuid' },
					{ id: 'title', type: 'text' },
				] },
				{ id: 'children', type: 'multi_group', items: [ { id: 'uid', type: 'hidden', generator: 'uuid' } ] },
			],
		} ],
	} );
	const readRows = () => JSON.parse( container.querySelector( 'input[name="groups"]' ).value );
	const uuids = row => [ row.uid, row.details.uid, ...row.children.map( child => child.uid ) ];
	const seen = new Set( uuids( original ) );

	for ( let i = 0; i < 2; i++ ) {
		await user.click( container.querySelector( '.wpifycf-field-multi-group__duplicate button' ) );
		const rows = readRows();
		expect( rows ).toHaveLength( i + 2 );
		expect( rows[ rows.length - 1 ] ).toEqual( original );
		for ( const uid of uuids( rows[ 0 ] ) ) {
			expect( validate( uid ) ).toBe( true );
			expect( seen.has( uid ) ).toBe( false );
			seen.add( uid );
		}
		expect( rows[ 0 ].details.title ).toBe( original.details.title );
	}
} );
