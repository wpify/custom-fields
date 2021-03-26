import React from 'react';
import ReactDOM from 'react-dom';
import CustomFields from './components/CustomFields';
import { parseDataset, registerField } from './helpers';
import TextField from './fields/TextField';

const WcfApp = (props) => {
	return (
		<React.Fragment>
			<CustomFields {...props} />
		</React.Fragment>
	);
};

const registerFields = () => {
	registerField('text', TextField);
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
