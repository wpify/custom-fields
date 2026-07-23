// Shared render helpers: wrap UI in the React Query + AppContext providers the
// components expect, and mount a field through the real App → RootFields → Field
// path so tests exercise the same tree production uses.
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppContextProvider } from '@/components/AppContext';
import { App } from '@/components/App';

export function makeQueryClient() {
	return new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
		// Swallow query errors so an accidental fetch can't fail a render test.
		logger: { log() {}, warn() {}, error() {} },
	} );
}

// Wrap arbitrary UI with both providers. `context` props (config, tabs, fields,
// values, ...) are forwarded to AppContextProvider.
export function renderWithProviders( ui, { queryClient, ...contextProps } = {} ) {
	const client = queryClient || makeQueryClient();

	return render(
		<QueryClientProvider client={ client }>
			<AppContextProvider
				context="default"
				config={ {} }
				tabs={ {} }
				fields={ [] }
				{ ...contextProps }
			>
				{ ui }
			</AppContextProvider>
		</QueryClientProvider>
	);
}

// Mount a single field definition through the real App. `values` seeds the
// context (defaults to { [field.id]: field.value }). Returns the RTL result.
export function renderApp( { fields, values, context = 'default', config = {}, tabs = {} } ) {
	const client = makeQueryClient();
	const seeded =
		values ||
		fields.reduce( ( acc, field ) => {
			if ( 'value' in field ) {
				acc[ field.id ] = field.value;
			}
			return acc;
		}, {} );

	return render(
		<QueryClientProvider client={ client }>
			<AppContextProvider
				context={ context }
				config={ config }
				tabs={ tabs }
				fields={ fields }
				initialValues={ seeded }
			>
				<App />
			</AppContextProvider>
		</QueryClientProvider>
	);
}
