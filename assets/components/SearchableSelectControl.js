import React, { useContext, useEffect, useRef, useState } from 'react';
import PT from 'prop-types';
import AppContext from './AppContext';
import { useFetch } from '../helpers';
import { __ } from '@wordpress/i18n';
import SelectControl from './SelectControl';

const normalizeValues = values => Array.isArray(values) ? values.map(String) : [String(values)];

const SearchableSelectControl = (props) => {
	const {
		id,
		value,
		onChange = (v) => null,
		options = [],
		list_type = null,
		required,
		isMulti = false,
		url,
		nonce,
		method = 'post',
		className,
	} = props;

	const { api } = useContext(AppContext);
	const [currentValue, setCurrentValue] = useState(normalizeValues(value));
	const [selectedOptions, setSelectedOptions] = useState(normalizeValues(value));
	const [search, setSearch] = useState('');
	const timer = useRef();
	const { fetch, result: currentOptions } = useFetch({ defaultValue: [] });

	useEffect(() => {
		setSelectedOptions(
			currentValue
				.map(value => currentOptions.find(option => String(option.value) === String(value)))
				.filter(Boolean)
		);
	}, [currentOptions, currentValue]);

	console.log(selectedOptions);

	useEffect(() => {
		if (!required) {
			options.unshift({ value: null, label: __('-', 'wpify-woo') });
		}
	}, [options]);

	useEffect(() => {
		if (list_type) {
			window.clearTimeout(timer.current);

			timer.current = window.setTimeout(() => {
				const body = { ...props, current_value: currentValue.filter(Boolean), search: search };
				fetch({ method, url, nonce, body });
			}, 500);

			return () => {
				window.clearTimeout(timer.current);
			};
		}
	}, [list_type, search, props, api, currentValue]);

	const handleChange = (options) => {
		setCurrentValue(isMulti
			? options.map(option => String(option.value))
			: [String(options.value)]
		);
	};

	useEffect(() => {
		onChange(isMulti ? currentValue : currentValue.find(Boolean));
	}, [value, currentValue]);

	return (
		<SelectControl
			id={id}
			onChange={handleChange}
			value={currentOptions.filter(option => currentValue.includes(String(option.value)))}
			onInputChange={setSearch}
			options={currentOptions}
			isMulti={isMulti}
			className={className}
		/>
	);
};

SearchableSelectControl.propTypes = {
	id: PT.string,
	value: PT.oneOfType([PT.string, PT.number]),
	onChange: PT.func,
	options: PT.array,
	list_type: PT.string,
	required: PT.bool,
	isMulti: PT.bool,
	url: PT.string,
	nonce: PT.string,
	method: PT.string,
	className: PT.string
};

export default SearchableSelectControl;
