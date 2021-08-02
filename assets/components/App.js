import PT from 'prop-types';
import React from 'react';
import Options from './Options';
import ProductOptions from './ProductOptions';
import AddTaxonomy from './AddTaxonomy';
import EditTaxonomy from './EditTaxonomy';
import Metabox from './Metabox';
import ErrorBoundary from './ErrorBoundary';

const App = (props) => {
	const { wcf = {} } = props;
	const { object_type } = wcf;

	const types = {
		options_page: Options,
		woocommerce_settings: Options,
		product_options: ProductOptions,
		add_taxonomy: AddTaxonomy,
		edit_taxonomy: EditTaxonomy,
		metabox: Metabox,
		default: Options,
	};

	const Component = types[object_type] || types.default;

	return (
		<ErrorBoundary>
			<Component appContext={wcf} />
		</ErrorBoundary>
	);
};

App.propTypes = {
	wcf: PT.object,
};

export default App;
