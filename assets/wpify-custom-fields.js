import React from 'react';
import ReactDOM from 'react-dom';
import PT from 'prop-types';
import Options from './components/Options';
import { parseDataset, registerField } from './helpers';
import TextField from './fields/TextField';
import UrlField from './fields/UrlField';
import EmailField from './fields/EmailField';
import NumberField from './fields/NumberField';
import Metabox from './components/Metabox';
import ProductOptions from './components/ProductOptions';
import AddTaxonomy from './components/AddTaxonomy';
import EditTaxonomy from './components/EditTaxonomy';

const WcfApp = (props) => {
	const { wcf: { object_type } } = props;

	if (['options_page', 'woocommerce_settings'].includes(object_type)) {
		return <Options {...props} />;
	}

	if (object_type === 'metabox') {
		return <Metabox {...props} />;
	}

	if (object_type === 'product_options') {
		return <ProductOptions {...props} />;
	}

	if (object_type === 'add_taxonomy') {
		return <AddTaxonomy {...props} />;
	}

	if (object_type === 'edit_taxonomy') {
		return <EditTaxonomy {...props} />;
	}

	return null;
};

WcfApp.propTypes = {
	wcf: PT.object,
};

const registerFields = () => {
	registerField('text', TextField);
	registerField('url', UrlField);
	registerField('email', EmailField);
	registerField('number', NumberField);
};

const renderWcf = () => {
	registerFields();

	document.querySelectorAll('.js-wcf[data-wcf]').forEach((container) => {
		const props = parseDataset(container.dataset);

		ReactDOM.render(<WcfApp {...props} />, container);
	});
};

window.addEventListener('load', renderWcf);
