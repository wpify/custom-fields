import React, { useCallback, useRef, useState, useEffect } from 'react';
import md5 from 'md5';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { fields } from './fields';
import apiFetch from '@wordpress/api-fetch';
import useSWRImmutable from 'swr/immutable';

export const getItemComponent = (item) => {
	return applyFilters('wcf_field_' + item.type, React.Fragment, item);
};

export const registerFieldType = (type, Field) => {
	addFilter('wcf_field_' + type, 'wpify-custom-fields', () => Field);
};

export const registerFieldTypes = () => {
	Object.keys(fields).forEach(type => {
		registerFieldType(type, fields[type]);
	});
};

export const clone = value => JSON.parse(JSON.stringify(value));

// source: https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
export const invertColor = (hex = '', bw = false) => {
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
	return '#' + r.padStart(2, '0') + g.padStart(2, '0') + b.padStart(2, '0');
};

export const useFetch = ({ defaultValue = null }) => {
	const controller = useRef(new AbortController());
	const [result, setResult] = useState(defaultValue);
	const memo = useRef({});

	const fetch = useCallback(({ method, url, nonce, body }) => {
		controller.current.abort();
		controller.current = new AbortController();

		const bodyStringified = JSON.stringify(body);
		const bodyMD5 = md5(bodyStringified);

		if (memo.current[bodyMD5]) {
			return setResult(memo.current[bodyMD5]);
		}

		window.fetch(url, {
			method,
			signal: controller.current.signal,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-WP-Nonce': nonce
			},
			body: bodyStringified,
		})
			.then(response => {
				if (response.ok) {
					return response.json();
				}
			})
			.then(result => {
				memo.current[bodyMD5] = result;
				setResult(result);
			})
			.catch(console.error);
	}, []);

	return { fetch, result };
};

export const useForceUpdate = () => {
	const [, setValue] = useState(0);
	return () => setValue(value => value + 1);
};

export const useTimeout = (callback, delay = 0) => {
	const callbackRef = useRef(callback);
	const timeoutRef = useRef();

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	const set = useCallback(() => {
		timeoutRef.current = setTimeout(() => {
			callbackRef.current();
		}, delay);
	}, [delay]);

	const clear = useCallback(() => {
		timeoutRef.current && clearTimeout(timeoutRef.current);
	}, []);

	useEffect(() => {
		set();
		return clear;
	}, [delay, set, clear]);

	const reset = useCallback(() => {
		clear();
		set();
	}, [clear, set]);

	return { reset, clear };
};

export const useDebounce = (callback, delay, dependencies) => {
	const { reset, clear } = useTimeout(callback, delay);
	useEffect(reset, [...dependencies, reset]);
	useEffect(clear, []);
};

export const fetcher = (args) => apiFetch({ ...args });

export const useOptions = (api, args) => {
	const [search, setSearch] = useState(args.search || '');

	useDebounce(() => {
		setSearch(args.search);
	}, 500, [args.search]);

	if (Array.isArray(args.options)) {
		return {
			data: args.options,
			isLoading: false,
			isError: false,
		};
	} else if (typeof args.options === 'string') {
		const { data, error } = useSWRImmutable({
			path: `${api.path}/options`,
			data: {
				...args,
				value: (Array.isArray(args.value) ? args.value : [args.value]).filter(Boolean),
				search,
			},
			method: 'POST',
		}, fetcher);

		const loadOptions = (inputValue, callback) => {
			return callback(
				data?.map(o => ({ ...o, label: htmlDecode(o.label) }))
			);
		};

		return {
			data,
			isLoading: !error && !data,
			isError: error,
			loadOptions
		};
	} else {
		const loadOptions = (inputValue, callback) => {
			return callback([]);
		};

		return {
			api,
			args,
			data: [],
			isLoading: false,
			isError: true,
			loadOptions,
		};
	}
};

export const stringify = (val) => Array.isArray(val) ? val.map(String) : String(val);

export const normalizeString = (str) => String(str)
	.normalize('NFD')
	.replace(/[\u0300-\u036f]/g, '')
	.replace(/\s+/g, ' ')
	.trim().toLowerCase();

export const htmlDecode = (input) => {
	const doc = new DOMParser().parseFromString(input, 'text/html');
	return doc.documentElement.textContent;
};

export const castString = (value) => {
	if (value === null || value === undefined) {
		return '';
	}

	return String(value);
};
