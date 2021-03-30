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
import GroupField from './fields/GroupField';
import RootWrapper from './components/RootWrapper';

const WcfApp = (props) => {
	const { wcf: { object_type } } = props;

	return <RootWrapper object_type={object_type} {...props} />
};

WcfApp.propTypes = {
	wcf: PT.object,
};

const renderWcf = () => {
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
	registerFieldType('group', GroupField);

	document.querySelectorAll('.js-wcf[data-wcf]').forEach((container) => {
		const props = parseDataset(container.dataset);

		console.log(props.wcf.items);

		ReactDOM.render(<WcfApp {...props} />, container);
	});
};

window.addEventListener('load', renderWcf);
