import React, { useEffect, useMemo, useState } from 'react';
import PT from 'prop-types';
import Select from 'react-select/async';
import classnames from 'classnames';
import { useOptions, normalizeString } from '../helpers';

const SelectControl = (props) => {
	const {
		id,
		onChange,
		required,
		isMulti = false,
		className,
		api,
		value,
		defaultOptions,
		setOptions,
		showSelected = true,
		otherArgs,
	} = props;

	const [inputValue, setInputValue] = useState('');
	const [optionsCache, setOptionsCache] = useState([]);
	const [optionsArgs, setOptionsArgs] = useState({ options: defaultOptions, search: inputValue, value, ...otherArgs });
	const response = useOptions(api, optionsArgs);
	const { isLoading, data: options } = response;

	useEffect(() => {
		const cachedIds = optionsCache.map(o => String(o.value));
		const notCached = Array.isArray(options) ? options.filter(o => !cachedIds.includes(String(o.value))) : [];

		if (notCached.length > 0) {
			setOptionsCache((cached) => [
				...cached,
				...notCached,
			]);
		}
	}, [options]);

	useEffect(() => {
		setOptionsArgs({ options: defaultOptions, search: inputValue, value, ...otherArgs });
	}, [defaultOptions, inputValue, value, props, otherArgs]);

	const valueOptions = useMemo(() => {
		const values = (Array.isArray(value) ? value : [value]).map(String);

		return optionsCache.filter(option => values.includes(String(option.value)));
	}, [value, optionsCache]);

	useEffect(() => {
		if (typeof setOptions === 'function') {
			setOptions(valueOptions);
		}
	}, [setOptions, valueOptions]);

	const optionToValue = (option) => {
		if (Array.isArray(option)) {
			return option.map(o => o.value);
		} else {
			return option?.value || '';
		}
	};

	const loadOptions = (inputValue, callback) => callback(options);

	const handleChange = (value) => {
		onChange(optionToValue(value));
	};

	const handleInputChange = (newValue) => {
		setInputValue(newValue);

		return newValue;
	};

	const handleFilter = (option, inputValue) => {
		if (typeof defaultOptions !== 'string') {
			const search = normalizeString(inputValue).split(' ');
			const label = normalizeString(option.label).split(' ');

			return search
				.map((word) => label.filter(l => l.indexOf(word) > -1 || String(word) === String(option.value)).length > 0)
				.every(Boolean);
		}

		return true;
	};

	return (
		<Select
			id={id}
			isMulti={isMulti}
			isLoading={isLoading}
			isClearable={!required}
			isSearchable
			cacheOptions
			defaultOptions={options}
			loadOptions={loadOptions}
			value={showSelected && valueOptions}
			onChange={handleChange}
			onInputChange={handleInputChange}
			filterOption={handleFilter}
			className={classnames('wcf-select', className)}
			classNamePrefix="wcf-select"
		/>
	);
};

SelectControl.propTypes = {
	className: PT.string,
	id: PT.string,
	value: PT.oneOfType([PT.string, PT.number]),
	onChange: PT.func,
	defaultOptions: PT.array,
	required: PT.bool,
	isMulti: PT.bool,
	api: PT.object,
	setOptions: PT.func,
	showSelected: PT.bool,
	otherArgs: PT.array,
};

export default SelectControl;
