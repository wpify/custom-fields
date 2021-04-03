import React, { useCallback, useEffect, useRef, useState } from 'react';
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
