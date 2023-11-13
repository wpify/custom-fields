import React, { useEffect, useMemo, useState, useRef } from 'react';
import Select, { components } from 'react-select';
import {
	SortableContainer,
	SortableElement,
	SortableHandle,
} from 'react-sortable-hoc';
import classnames from 'classnames';
import { useOptions, normalizeString } from '../helpers';
import { htmlDecode } from '../helpers';

function arrayMove(array, from, to) {
	const slicedArray = array.slice();
	slicedArray.splice(
		to < 0 ? array.length + to : to,
		0,
		slicedArray.splice(from, 1)[0]
	);
	return slicedArray;
}

const SortableMultiValue = SortableElement(
	(props) => {
		// this prevents the menu from being opened/closed when the user clicks
		// on a value to begin dragging it. ideally, detecting a click (instead of
		// a drag) would still focus the control and toggle the menu, but that
		// requires some magic with refs that are out of scope for this example
		const onMouseDown = (e) => {
			e.preventDefault();
			e.stopPropagation();
		};
		const innerProps = { ...props.innerProps, onMouseDown };
		return <components.MultiValue {...props} innerProps={innerProps} />;
	}
);

const SortableMultiValueLabel = SortableHandle(
	(props) => <components.MultiValueLabel {...props} />
);

const SortableSelect = SortableContainer(Select);

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

		return values.map(val => optionsCache.find(o => String(o.value) === val)).filter(Boolean);
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

	const onSortEnd = ({ oldIndex, newIndex }) => {
		const newValue = arrayMove(value, oldIndex, newIndex);
		onChange(newValue);
	};

	return isMulti ? (
		<SortableSelect
			id={id}
			isMulti={true}
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
			menuPortalTarget={portal.current}
			useDragHandle
			axis="xy"
			onSortEnd={onSortEnd}
			distance={4}
			getHelperDimensions={({ node }) => node.getBoundingClientRect()}
			components={{
				Option,
				SingleValue,
				MultiValue: SortableMultiValue,
				MultiValueLabel: SortableMultiValueLabel,
			}}
			closeMenuOnSelect={false}
		/>
	) : (
		<Select
			id={id}
			isMulti={false}
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
			menuPortalTarget={portal.current}
		/>
	)
};

export default SelectControl;
