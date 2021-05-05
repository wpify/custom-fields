__webpack_public_path__ = window.wcf_build_url;

import React from 'react';
import ReactDOM from 'react-dom';
import PT from 'prop-types';
import { parseDataset, registerFieldTypes } from './helpers';
import Options from './components/Options';
import Metabox from './components/Metabox';
import ProductOptions from './components/ProductOptions';
import AddTaxonomy from './components/AddTaxonomy';
import EditTaxonomy from './components/EditTaxonomy';
import AppContext from './components/AppContext';
import ErrorBoundary from './components/ErrorBoundary';

const WcfApp = (props) => {
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
		<AppContext.Provider value={wcf}>
			<ErrorBoundary>
				<Component/>
			</ErrorBoundary>
		</AppContext.Provider>
	);
};

WcfApp.propTypes = {
	wcf: PT.object,
};

const renderWcf = () => {
	registerFieldTypes();

	document.querySelectorAll('.js-wcf[data-wcf]').forEach((container) => {
		const props = parseDataset(container.dataset);

		ReactDOM.render(<WcfApp {...props} />, container);
	});
};

window.addEventListener('load', renderWcf);
