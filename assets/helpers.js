import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import md5 from 'md5';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { fields } from './fields';
import apiFetch from '@wordpress/api-fetch';
import useSWRImmutable from 'swr/immutable';
import { v4 as uuid } from 'uuid';

const DivComponent = (props) => {
	const { className, id, title } = props;

	return <div className={className} id={id} title={title} />;
}

export const getItemComponent = (item) => {
	return applyFilters('wcf_field_' + item.type, DivComponent, item);
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

export const useOptions = (api, args, params = {}) => {
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
		let query = '';

		if (Object(params) === params && Object.keys(params).length > 0) {
			query = '?' + String(new URLSearchParams(params));
		}

		const { data, error } = useSWRImmutable({
			path: `${api.path}/options${query}`,
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

export const useNormalizedValue = (props) => {
	const value = useMemo(() => {
		if (props.generator) {
			return applyFilters('wcf_generator_' + props.generator, props.value, props);
		}

		return props.value;
	}, [props]);

	let normalizedValue = value;

	if (typeof normalizedValue === 'undefined' && typeof props.default !== 'undefined') {
		normalizedValue = props.default;
	}

	const defaultLinkValue = { label: '', url: '', target: null };

	if (typeof normalizedValue === 'undefined') {
		if (['multi_group', 'multi_select', 'multi_attachment', 'multi_post', 'multi_toggle'].includes(props.type)) {
			normalizedValue = [];
		} else if(['group'].includes(props.type)) {
			normalizedValue = {};
		} else if (['attachment', 'post'].includes(props.type)) {
			normalizedValue = 0;
		} else if ('link' === props.type) {
			normalizedValue = defaultLinkValue;
		} else {
			normalizedValue = '';
		}
	}

	if ('link' === props.type) {
		if (typeof normalizedValue === 'string') {
			normalizedValue = { ...defaultLinkValue, url: normalizedValue };
		} else if (Object(normalizedValue) !== normalizedValue) {
			normalizedValue = defaultLinkValue;
		} else {
			Object.keys(defaultLinkValue).forEach(key => {
				normalizedValue[key] = normalizedValue[key] || defaultLinkValue[key];
			});
		}
	} else if (['post', 'multi_post', 'attachment', 'multi_attachment'].includes(props.type)) {
		if (!Array.isArray(normalizedValue)) {
			normalizedValue = [normalizedValue];
		}

		normalizedValue = normalizedValue.filter(Boolean).map(v => parseInt(v, 10));
	} else if ('multi_group' === props.type) {
		if (!Array.isArray(normalizedValue)) {
			normalizedValue = [];
		} else {
			normalizedValue = clone(normalizedValue);
		}

		normalizedValue = normalizedValue.map((value) => {
			value.__key = uuid();
			return value;
		});
	} else if ('multi_toggle' === props.type && ! Array.isArray(normalizedValue)) {
		normalizedValue = [];
	}

	const [currentValue, setCurrentValue] = useState(normalizedValue);

	return { value, currentValue, setCurrentValue };
};
