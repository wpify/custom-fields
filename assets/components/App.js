import PT from 'prop-types';
import React, { useState, useCallback, useMemo } from 'react';
import Options from './Options';
import ProductOptions from './ProductOptions';
import AddTaxonomy from './AddTaxonomy';
import EditTaxonomy from './EditTaxonomy';
import Metabox from './Metabox';
import ErrorBoundary from './ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const App = (props) => {
	const originalWcf = props.wcf;
	const [data, setData] = useState(Object.fromEntries(originalWcf.items.map(i => [i.id, i.value])));

	const wcf = useMemo(() => {
		const newWcf = applyFilters('wcf_definition', originalWcf, data);

		if (JSON.stringify(newWcf) !== JSON.stringify(originalWcf)) {
			return newWcf;
		}

		return originalWcf;
	}, [applyFilters, originalWcf, data]);

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
