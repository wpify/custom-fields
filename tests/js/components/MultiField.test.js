// MultiField.js is the generic repeater behind every multi_* type: add / remove
// rows, enforce min/max, and reorder via Sortable.js. Sortable is mocked so the
// reorder callback can be invoked directly (real drag isn't feasible in jsdom).
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../support/providers';

jest.mock( 'sortablejs', () => {
	const create = jest.fn( ( element, options ) => {
		globalThis.__lastSortableOptions = options;
		return { destroy: () => {}, option: () => {} };
	} );
	return { __esModule: true, default: { create } };
} );

const rowInputs = ( container ) =>
	container.querySelectorAll( '.wpifycf-multi-field-item input.wpifycf-field-text' );

describe( 'MultiField add / remove', () => {
	it( 'adds a row when the add button is clicked', async () => {
		const user = userEvent.setup();
		const { container } = renderApp( {
			fields: [ { id: 'list', type: 'multi_text', value: [ 'a' ] } ],
		} );

		expect( rowInputs( container ) ).toHaveLength( 1 );

		await user.click( container.querySelector( '.wpifycf-multi-field-item-buttons-after button' ) );

		expect( rowInputs( container ) ).toHaveLength( 2 );
	} );

	it( 'removes a row when its remove button is clicked', async () => {
		const user = userEvent.setup();
		const { container } = renderApp( {
			fields: [ { id: 'list', type: 'multi_text', value: [ 'a', 'b' ] } ],
		} );

		expect( rowInputs( container ) ).toHaveLength( 2 );

		const removeButton = container.querySelector(
			'.wpifycf-multi-field-item-actions button'
		);
		await user.click( removeButton );

		expect( rowInputs( container ) ).toHaveLength( 1 );
	} );
} );

describe( 'MultiField min / max constraints', () => {
	it( 'pads up to the minimum number of rows', () => {
		const { container } = renderApp( {
			fields: [ { id: 'list', type: 'multi_text', value: [ 'a' ], min: 3 } ],
		} );

		expect( rowInputs( container ) ).toHaveLength( 3 );
	} );

	it( 'trims down to the maximum number of rows', () => {
		const { container } = renderApp( {
			fields: [ { id: 'list', type: 'multi_text', value: [ 'a', 'b', 'c' ], max: 2 } ],
		} );

		expect( rowInputs( container ) ).toHaveLength( 2 );
	} );

	it( 'hides the add button once the maximum is reached', () => {
		const { container } = renderApp( {
			fields: [ { id: 'list', type: 'multi_text', value: [ 'a', 'b' ], max: 2 } ],
		} );

		expect(
			container.querySelector( '.wpifycf-multi-field-item-buttons-after' )
		).not.toBeInTheDocument();
	} );
} );

describe( 'MultiField reorder (Sortable mocked)', () => {
	it( 'reorders values when Sortable reports a drag end', () => {
		const { container } = renderApp( {
			fields: [ { id: 'list', type: 'multi_text', value: [ 'a', 'b', 'c' ] } ],
		} );

		const before = Array.from( rowInputs( container ) ).map( ( i ) => i.value );
		expect( before ).toEqual( [ 'a', 'b', 'c' ] );

		// Simulate dragging the first row to the last position.
		act( () => {
			globalThis.__lastSortableOptions.onEnd( {
				oldIndex: 0,
				newIndex: 2,
				stopPropagation: () => {},
			} );
		} );

		const after = Array.from( rowInputs( container ) ).map( ( i ) => i.value );
		expect( after ).toEqual( [ 'b', 'c', 'a' ] );
	} );
} );
