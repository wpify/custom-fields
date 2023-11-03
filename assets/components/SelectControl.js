import React, { useEffect, useMemo, useState, useRef } from 'react';
import Select from 'react-select';
import classnames from 'classnames';
import { useOptions, normalizeString } from '../helpers';
import { htmlDecode } from '../helpers';

const Option = (props) => {
	const { children, innerProps, getStyles } = props;
	return (
		<div {...innerProps} style={getStyles('option', props)}>
			{typeof children === 'string' ? htmlDecode(children) : children}
		</div>
	)
};

const SingleValue = (props) => {
	const { children, innerProps, getStyles } = props;
	return (
		<div {...innerProps} style={getStyles('singleValue', props)}>
			{typeof children === 'string' ? htmlDecode(children) : children}
		</div>
	)
};

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
		listId,
		async,
		asyncParams,
	} = props;

	const [inputValue, setInputValue] = useState('');
	const [optionsCache, setOptionsCache] = useState([]);
	const [optionsArgs, setOptionsArgs] = useState({
		options: defaultOptions,
		search: inputValue,
		listId,
		value,
		...otherArgs
	});
	const response = useOptions(api, optionsArgs, asyncParams);
	const { isLoading, data: options } = response;
	const portal = useRef();

	useEffect(() => {
		portal.current = document.createElement('div');
		document.body.appendChild(portal.current);

		return () => {
			document.body.removeChild(portal.current);
		}
	}, []);

	useEffect(() => {
		const cachedIds = optionsCache.map(o => String(o.value));
		const notCached = Array.isArray(options)
			? options.filter(o => !cachedIds.includes(String(o.value)))
			: [];

		if (notCached.length > 0) {
			setOptionsCache((cached) => [
				...cached,
				...notCached,
			]);
		}
	}, [options]);

	useEffect(() => {
		setOptionsArgs({
			options: defaultOptions,
			search: inputValue,
			value,
			listId,
			...otherArgs
		});
	}, [defaultOptions, inputValue, value, props, listId, otherArgs]);

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
			options={options}
			value={showSelected && valueOptions}
			onChange={handleChange}
			onInputChange={handleInputChange}
			filterOption={handleFilter}
			className={classnames('wcf-select', className)}
			classNamePrefix="wcf-select"
			components={{ Option, SingleValue }}
			menuPortalTarget={portal.current}
		/>
	);
};

export default SelectControl;
