/* eslint-disable react/prop-types, no-redeclare, no-unused-vars, no-global-assign */
/* global __webpack_public_path__ */

__webpack_public_path__ = window.wcf_build_url;

import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerFieldTypes } from './helpers';
import App from './components/App';

function loadCustomFields (event) {
	document.querySelectorAll('.js-wcf[data-loaded=false]').forEach((container) => {
		const hash = container.dataset.hash;

		if (hash) {
			const wcf = (window.wcf_data || {})[hash];

			if (wcf) {
				if (event?.detail?.loop !== undefined) {
					wcf.hooks = {
						name: (name) => name + '[' + event.detail.loop + ']',
						id: (id) => id + '_' + event.detail.loop,
					};
				} else {
					wcf.hooks = {
						name: (name) => name,
						id: (id) => id,
					};
				}

				createRoot(container).render(<App wcf={wcf}/>);
				container.dataset.loaded = true;
			}
		}
	});
}

window.addEventListener('load', () => {
	registerFieldTypes();
	loadCustomFields();
});

document.addEventListener('wcf_product_variation_loaded', loadCustomFields);
