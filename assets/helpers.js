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

export const getItemComponent = (item) => {
	return applyFilters('wcf_field_' + item.type, React.Fragment, item);
};

export const registerFieldType = (type, Field) => {
	addFilter('wcf_field_' + type, 'wpify-custom-fields', Component => Field);
};
