/* eslint-disable react/prop-types, no-redeclare, no-unused-vars, no-global-assign */
/* global __webpack_public_path__ */

__webpack_public_path__ = window.wcf_build_url;

import React from 'react';
import ReactDOM from 'react-dom';
import { parseDataset, registerFieldTypes } from './helpers';
import App from './components/App';

window.addEventListener('load', () => {
	registerFieldTypes();

	document.querySelectorAll('.js-wcf[data-wcf]').forEach((container) => {
		const props = parseDataset(container.dataset);

		ReactDOM.render(<App {...props} />, container);
	});
});
