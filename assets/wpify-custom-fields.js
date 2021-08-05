/* eslint-disable react/prop-types, no-redeclare, no-unused-vars, no-global-assign */
/* global __webpack_public_path__ */

__webpack_public_path__ = window.wcf_build_url;

import React from 'react';
import ReactDOM from 'react-dom';
import { registerFieldTypes } from './helpers';
import App from './components/App';

window.addEventListener('load', () => {
	registerFieldTypes();

	document.querySelectorAll('.js-wcf[data-hash]').forEach((container) => {
		const hash = container.dataset.hash;
		if (hash) {
			const wcf = (window.wcf_data||{})[hash];
			ReactDOM.render(<App wcf={wcf} />, container);
		}
	});
});
