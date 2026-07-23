import { applyFilters } from '@wordpress/hooks';
// Importing registers the uuid generator filter as a side effect.
import '@/helpers/generators';

describe( 'wpifycf_generator_uuid', () => {
	it( 'generates a v4 UUID when the value is empty', () => {
		const result = applyFilters( 'wpifycf_generator_uuid', '', {} );
		expect( result ).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
		);
	} );

	it( 'preserves an existing value', () => {
		const existing = 'already-set';
		expect( applyFilters( 'wpifycf_generator_uuid', existing, {} ) ).toBe( existing );
	} );

	it( 'produces a distinct value on each empty invocation', () => {
		const a = applyFilters( 'wpifycf_generator_uuid', '', {} );
		const b = applyFilters( 'wpifycf_generator_uuid', '', {} );
		expect( a ).not.toBe( b );
	} );
} );
