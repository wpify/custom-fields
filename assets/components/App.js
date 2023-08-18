import React, { useState, useCallback, useMemo } from 'react';
import Options from './Options';
import ProductOptions from './ProductOptions';
import ProductVariationOptions from './ProductVariationOptions';
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
	function findDuplicateIds(obj) {
		const idSet = new Set();
		const duplicateIds = new Set();

		function traverseObject(obj, prefix = '') {
			if (obj.id) {
				if (idSet.has(prefix + obj.id)) {
					duplicateIds.add(prefix + obj.id); // Add the duplicate ID to the set
				}
				idSet.add(prefix + obj.id);
			}

			if (obj.items && Array.isArray(obj.items)) {
				for (const item of obj.items) {
					traverseObject(item, obj.id ? prefix + obj.id + '.' : prefix);
				}
			}
		}

		traverseObject(obj);

		return Array.from(duplicateIds);
	}

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
		product_variation_options: ProductVariationOptions,
		add_taxonomy: AddTaxonomy,
		edit_taxonomy: EditTaxonomy,
		metabox: Metabox,
		default: Options,
	};

	const Component = types[object_type] || types.default;

	return (
		<ErrorBoundary>
			{findDuplicateIds(wcf).length ? <>Duplicated ids found in the definition: <strong>{findDuplicateIds(wcf).join(', ')}</strong></> : <Component handleChange={handleChange} appContext={wcf} />}
		</ErrorBoundary>
	);
};

export default App;
