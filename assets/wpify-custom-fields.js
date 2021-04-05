import './wpify-custom-fields.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import PT from 'prop-types';
import { parseDataset, registerFieldType } from './helpers';
import TextField from './fields/TextField';
import UrlField from './fields/UrlField';
import EmailField from './fields/EmailField';
import NumberField from './fields/NumberField';
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
import HtmlField from './fields/HtmlField';
import MultiGroupField from './fields/MultiGroupField';
import CheckboxField from './fields/CheckboxField';
import ToggleField from './fields/ToggleField';
import Options from './components/Options';
import Metabox from './components/Metabox';
import ProductOptions from './components/ProductOptions';
import AddTaxonomy from './components/AddTaxonomy';
import EditTaxonomy from './components/EditTaxonomy';
import SelectField from './fields/SelectField';
import AppContext from './components/AppContext';
import MultiSelectField from './fields/MultiSelectField';
import CodeField from './fields/CodeField';
import PostField from './fields/PostField';
import MultiPostField from './fields/MultiPostField';
import AttachmentField from './fields/AttachmentField';
import MultiAttachmentField from './fields/MultiAttachmentField';
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
	registerFieldType('html', HtmlField);
	registerFieldType('group', GroupField);
	registerFieldType('multi_group', MultiGroupField);
	registerFieldType('checkbox', CheckboxField);
	registerFieldType('toggle', ToggleField);
	registerFieldType('select', SelectField);
	registerFieldType('multi_select', MultiSelectField);
	registerFieldType('code', CodeField);
	registerFieldType('post', PostField);
	registerFieldType('multi_post', MultiPostField);
	registerFieldType('attachment', AttachmentField);
	registerFieldType('multi_attachment', MultiAttachmentField);

	document.querySelectorAll('.js-wcf[data-wcf]').forEach((container) => {
		const props = parseDataset(container.dataset);

		ReactDOM.render(<WcfApp {...props} />, container);
	});
};

window.addEventListener('load', renderWcf);
