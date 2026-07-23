// AppContext supports two modes: uncontrolled (form integrations manage values
// in internal state) and controlled (Gutenberg passes values + a curried
// updateValue down, so the block's attributes stay the source of truth).
import { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext, AppContextProvider } from '@/components/AppContext';

function Consumer() {
	const { values, updateValue, currentTab } = useContext( AppContext );
	return (
		<div>
			<span data-testid="value">{ String( values.foo ) }</span>
			<span data-testid="tab">{ currentTab }</span>
			<button type="button" onClick={ () => updateValue( 'foo' )( 'bar' ) }>
				set
			</button>
		</div>
	);
}

describe( 'AppContext — uncontrolled (form) mode', () => {
	it( 'seeds from initialValues and updates internal state', async () => {
		const user = userEvent.setup();
		render(
			<AppContextProvider context="default" config={ {} } tabs={ {} } fields={ [] } initialValues={ { foo: 'init' } }>
				<Consumer />
			</AppContextProvider>
		);

		expect( screen.getByTestId( 'value' ) ).toHaveTextContent( 'init' );

		await user.click( screen.getByText( 'set' ) );

		expect( screen.getByTestId( 'value' ) ).toHaveTextContent( 'bar' );
	} );
} );

describe( 'AppContext — controlled (Gutenberg) mode', () => {
	it( 'reads passed values and delegates updates to the passed callback', async () => {
		const user = userEvent.setup();
		const innerSetter = jest.fn();
		const updateValue = jest.fn( () => innerSetter );

		render(
			<AppContextProvider
				context="gutenberg"
				config={ {} }
				tabs={ {} }
				fields={ [] }
				values={ { foo: 'controlled' } }
				updateValue={ updateValue }
			>
				<Consumer />
			</AppContextProvider>
		);

		expect( screen.getByTestId( 'value' ) ).toHaveTextContent( 'controlled' );

		await user.click( screen.getByText( 'set' ) );

		// The curried passed updateValue is used, not internal state.
		expect( updateValue ).toHaveBeenCalledWith( 'foo' );
		expect( innerSetter ).toHaveBeenCalledWith( 'bar' );
		// The displayed value is still driven by the passed prop (unchanged).
		expect( screen.getByTestId( 'value' ) ).toHaveTextContent( 'controlled' );
	} );
} );

describe( 'AppContext — tabs', () => {
	it( 'defaults currentTab to the first tab when none is in the URL', () => {
		render(
			<AppContextProvider
				context="default"
				config={ {} }
				tabs={ { general: { label: 'General' }, advanced: { label: 'Advanced' } } }
				fields={ [] }
			>
				<Consumer />
			</AppContextProvider>
		);

		expect( screen.getByTestId( 'tab' ) ).toHaveTextContent( 'general' );
	} );

	it( 'in gutenberg mode ignores the URL hash for the initial tab', () => {
		act( () => {
			window.location.hash = '#tab=advanced';
		} );

		render(
			<AppContextProvider
				context="gutenberg"
				config={ {} }
				tabs={ { general: { label: 'General' }, advanced: { label: 'Advanced' } } }
				fields={ [] }
			>
				<Consumer />
			</AppContextProvider>
		);

		// Gutenberg does not read the hash, so it falls back to the first tab.
		expect( screen.getByTestId( 'tab' ) ).toHaveTextContent( 'general' );

		act( () => {
			window.location.hash = '';
		} );
	} );
} );
