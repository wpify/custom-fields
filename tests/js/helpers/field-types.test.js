import { addFilter, removeFilter } from '@wordpress/hooks';
import { getFieldComponentByType } from '@/helpers/functions';
import fieldTypes from '@/fields';

describe( 'getFieldComponentByType', () => {
	it( 'resolves a known type to its registered component', () => {
		expect( getFieldComponentByType( 'text' ) ).toBe( fieldTypes.text );
		expect( getFieldComponentByType( 'multi_group' ) ).toBe( fieldTypes.multi_group );
	} );

	it( 'falls back to the text component for an unknown type', () => {
		expect( getFieldComponentByType( 'does_not_exist' ) ).toBe( fieldTypes.text );
	} );

	it( 'lets a wpifycf_field_{type} filter register a custom component', () => {
		const Custom = () => null;
		addFilter( 'wpifycf_field_my_custom', 'test', () => Custom );

		expect( getFieldComponentByType( 'my_custom' ) ).toBe( Custom );

		removeFilter( 'wpifycf_field_my_custom', 'test' );
	} );

	it( 'exposes multi_* aliases as thin wrappers with their own checkValidity', () => {
		// The multi wrappers are distinct components from their base type but
		// carry a static checkValidity, which the dispatcher relies on.
		expect( typeof fieldTypes.multi_text.checkValidity ).toBe( 'function' );
		expect( fieldTypes.multi_text ).not.toBe( fieldTypes.text );
	} );
} );
