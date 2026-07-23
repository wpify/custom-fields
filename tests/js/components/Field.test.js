// Field.js is the central dispatcher: it resolves a type to its component,
// evaluates conditions to show/hide, and always emits a hidden <input> carrying
// the value (tagged data-hide-field) so hidden fields still submit.
import { renderApp } from '../support/providers';

describe( 'Field dispatcher', () => {
	it( 'resolves the type to its component and renders it', () => {
		const { container } = renderApp( {
			fields: [ { id: 'greeting', type: 'text', value: 'hi there' } ],
		} );

		const input = container.querySelector( 'input.wpifycf-field-text' );
		expect( input ).toBeInTheDocument();
		expect( input ).toHaveValue( 'hi there' );
	} );

	it( 'always emits a hidden input for the field, tagged not-hidden when shown', () => {
		const { container } = renderApp( {
			fields: [ { id: 'greeting', type: 'text', value: 'hi' } ],
		} );

		const hidden = container.querySelector( 'input[type="hidden"][name="greeting"]' );
		expect( hidden ).toBeInTheDocument();
		expect( hidden ).toHaveAttribute( 'data-hide-field', 'false' );
		expect( hidden ).toHaveValue( 'hi' );
	} );

	it( 'renders type="hidden" fields as only a hidden input', () => {
		const { container } = renderApp( {
			fields: [ { id: 'secret', type: 'hidden', value: 'x' } ],
		} );

		const hidden = container.querySelector( 'input[type="hidden"][name="secret"]' );
		expect( hidden ).toBeInTheDocument();
		expect( hidden ).toHaveAttribute( 'data-hide-field', 'true' );
		// No visible control wrapper is rendered for a hidden-type field.
		expect( container.querySelector( '.wpifycf-field__control' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'Field conditions', () => {
	const fieldsFor = ( controlValue ) => [
		{ id: 'ctrl', type: 'text', value: controlValue },
		{
			id: 'dep',
			type: 'text',
			value: 'dep-value',
			conditions: [ { field: 'ctrl', condition: '==', value: 'show' } ],
		},
	];

	it( 'hides the dependent control when its condition is false', () => {
		const { container } = renderApp( { fields: fieldsFor( 'no' ) } );

		// The dependent field's visible control is not mounted...
		const depControls = container.querySelectorAll( 'input.wpifycf-field-text' );
		// Only the control field's input is present (not the dependent one).
		expect( depControls ).toHaveLength( 1 );

		// ...but its hidden input still submits, tagged hidden.
		const depHidden = container.querySelector( 'input[type="hidden"][name="dep"]' );
		expect( depHidden ).toBeInTheDocument();
		expect( depHidden ).toHaveAttribute( 'data-hide-field', 'true' );
		expect( depHidden ).toHaveValue( 'dep-value' );
	} );

	it( 'shows the dependent control when its condition is true', () => {
		const { container } = renderApp( { fields: fieldsFor( 'show' ) } );

		expect( container.querySelectorAll( 'input.wpifycf-field-text' ) ).toHaveLength( 2 );
		const depHidden = container.querySelector( 'input[type="hidden"][name="dep"]' );
		expect( depHidden ).toHaveAttribute( 'data-hide-field', 'false' );
	} );
} );
