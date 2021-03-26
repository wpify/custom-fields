import React from 'react';
import { addFilter, applyFilters } from '@wordpress/hooks';

export const parseDataset = (dataset) => {
	const props = { ...dataset };

	Object.keys(props).forEach((key) => {
		try {
			props[key] = JSON.parse(props[key]);
		} catch (e) {
			if (!Number.isNaN(props[key]) && !Number.isNaN(parseFloat(props[key]))) {
				props[key] = parseFloat(props[key]);
			} else if (['true', 'false'].includes(props[key])) {
				props[key] = Boolean(props[key]);
			} else if (props[key] === 'null') {
				props[key] = null;
			}
		}
	});

	return props;
};

export const registerField = (type, Field) => {
	addFilter('wcf-text', 'wpify-custom-fields', (Component, props) => <Field {...props} />);
};

export const renderField = (data) => {
	return applyFilters('wcf-' + data.type, data);
};
