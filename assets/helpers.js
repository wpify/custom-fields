import React, { useCallback, useEffect, useRef, useState } from 'react';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { fields } from './fields';

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

export const registerFieldTypes = () => {
	Object.keys(fields).forEach(type => {
		registerFieldType(type, fields[type]);
	});
};

export const clone = value => JSON.parse(JSON.stringify(value));

// source: https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
export const invertColor = (hex, bw) => {
	if (hex.indexOf('#') === 0) {
		hex = hex.slice(1);
	}

	// convert 3-digit hex to 6-digits.
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	if (hex.length !== 6) {
		return '#000000';
	}

	let r = parseInt(hex.slice(0, 2), 16);
	let g = parseInt(hex.slice(2, 4), 16);
	let b = parseInt(hex.slice(4, 6), 16);

	if (bw) {
		// http://stackoverflow.com/a/3943023/112731
		return (r * 0.299 + g * 0.587 + b * 0.114) > 186
			? '#000000'
			: '#FFFFFF';
	}

	// invert color components
	r = (255 - r).toString(16);
	g = (255 - g).toString(16);
	b = (255 - b).toString(16);

	// pad each with zeros and return
	return "#" + padZero(r) + padZero(g) + padZero(b);
};

export const useFetch = ({ defaultValue = null }) => {
	const controller = useRef(new AbortController());
	const [result, setResult] = useState(defaultValue);

	const fetch = useCallback(({ method, url, nonce, body }) => {
		controller.current.abort();
		controller.current = new AbortController();

		window.fetch(url, {
			method,
			signal: controller.current.signal,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-WP-Nonce': nonce
			},
			body: JSON.stringify(body),
		}).then(response => {
			if (response.ok) {
				return response.json();
			}
		}).then(setResult);
	}, []);

	return { fetch, result };
};

export const useDelay = (callback, deps, timeout = 500) => {
	const timer = useRef(0);

	useEffect(() => {
		window.clearTimeout(timer.current);

		timer.current = window.setTimeout(callback, timeout);

		return () => {
			window.clearTimeout(timer.current);
		};
	}, [...deps]);
};

export const useForceUpdate = () => {
	const [value, setValue] = useState(0);
	return () => setValue(value => value + 1);
};
