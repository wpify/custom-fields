import PT from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';
import Options from './Options';
import ProductOptions from './ProductOptions';
import AddTaxonomy from './AddTaxonomy';
import EditTaxonomy from './EditTaxonomy';
import Metabox from './Metabox';
import ErrorBoundary from './ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const App = (props) => {
	const [wcf, setWcf] = useState(props.wcf);
	const [data, setData] = useState(Object.fromEntries(wcf.items.map(i => [i.id, i.value])));

	const handleChange = useCallback((item) => (value) => {
		setData((data) => {
			const newData = {
				...data,
				[item.id]: value,
			};

			if (JSON.stringify(newData) !== JSON.stringify(data)) {
				return newData;
			}

			return data;
		});
	}, [setData]);

	useEffect(() => {
		setWcf((wcf) => {
			const newWcf = applyFilters('wcf_definition', wcf, data);

			if (JSON.stringify(newWcf) !== JSON.stringify(wcf)) {
				return newWcf;
			}

			return wcf;
		});
	}, [data]);

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
			<Component handleChange={handleChange} appContext={wcf} />
		</ErrorBoundary>
	);
};

App.propTypes = {
	wcf: PT.object,
};

export default App;
