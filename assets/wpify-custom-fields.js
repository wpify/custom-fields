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

const WcfApp = (props) => {
	if (props.wcf.object_type === 'options_page') {
		return <Options {...props} />;
	}

	if (props.wcf.object_type === 'metabox') {
		return <Metabox {...props} />
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

		ReactDOM.render(
			<WcfApp {...props} />,
			container
		);
	});
};

window.addEventListener('load', renderWcf);
