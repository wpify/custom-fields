import React from 'react';
import ReactDOM from 'react-dom';
import PT from 'prop-types';
import Options from './components/Options';
import { parseDataset, registerFieldType } from './helpers';
import TextField from './fields/TextField';
import UrlField from './fields/UrlField';
import EmailField from './fields/EmailField';
import NumberField from './fields/NumberField';
import Metabox from './components/Metabox';
import ProductOptions from './components/ProductOptions';
import AddTaxonomy from './components/AddTaxonomy';
import EditTaxonomy from './components/EditTaxonomy';
import TitleField from './fields/TitleField';
import TelField from './fields/TelField';
import PasswordField from './fields/PasswordField';
import ColorField from './fields/ColorField';
import DatetimeField from './fields/DatetimeField';
import MonthField from './fields/MonthField';
import DateField from './fields/DateField';
import TimeField from './fields/TimeField';
import WeekField from './fields/WeekField';
import TextareaField from './fields/TextareaField';

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
	registerFieldType('text', TextField);
	registerFieldType('url', UrlField);
	registerFieldType('email', EmailField);
	registerFieldType('number', NumberField);
	registerFieldType('title', TitleField);
	registerFieldType('tel', TelField);
	registerFieldType('password', PasswordField);
	registerFieldType('color', ColorField);
	registerFieldType('datetime', DatetimeField);
	registerFieldType('month', MonthField);
	registerFieldType('date', DateField);
	registerFieldType('time', TimeField);
	registerFieldType('week', WeekField);
	registerFieldType('textarea', TextareaField);
};

const renderWcf = () => {
	registerFields();

	document.querySelectorAll('.js-wcf[data-wcf]').forEach((container) => {
		const props = parseDataset(container.dataset);
		ReactDOM.render(<WcfApp {...props} />, container);
	});
};

window.addEventListener('load', renderWcf);
