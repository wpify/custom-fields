import React, { useContext, useEffect, useState } from 'react';
import PT from 'prop-types';
import AppContext from './AppContext';
import { useDelay, useFetch } from '../helpers';
import { __ } from '@wordpress/i18n';
import SelectControl from './SelectControl';

const normalizeValues = values => Array.isArray(values) ? values.map(String) : [String(values)];

const SearchableSelectControl = (props) => {
	const {
		id,
		value,
		onChange = (v) => null,
		options,
		isMulti = false,
		url,
		nonce,
		method = 'post',
		className,
	} = props;

	const { api } = useContext(AppContext);
	const [currentValue, setCurrentValue] = useState(normalizeValues(value));
	const [search, setSearch] = useState('');
	const { fetch, result: currentOptions } = useFetch({ defaultValue: options || [] });

	useDelay(() => {
		if (!options) {
			const body = { ...props, current_value: currentValue.filter(Boolean), search: search };
			fetch({ method, url, nonce, body });
		}
	}, [options, search, props, api, currentValue]);

	useEffect(() => {
		onChange(isMulti ? currentValue : currentValue.find(Boolean));
	}, [value, currentValue]);

	const handleChange = (options) => {
		setCurrentValue(isMulti
			? options.map(option => String(option.value))
			: [String(options.value)]
		);
	};

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
	required: PT.bool,
	isMulti: PT.bool,
	url: PT.string,
	nonce: PT.string,
	method: PT.string,
	className: PT.string
};

export default SearchableSelectControl;
