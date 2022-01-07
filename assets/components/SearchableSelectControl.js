import React, { useEffect, useRef, useState } from 'react';
import PT from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useFetch } from '../helpers';
import SelectControl from './SelectControl';
import ErrorBoundary from './ErrorBoundary';
import Button from './Button';
import classnames from 'classnames';

const normalizeValues = values => Array.isArray(values)
	? values.map(String)
	: (values ? [String(values)] : []);

const SearchableSelectControl = (props) => {
	const {
		id,
		value,
		onChange = () => {},
		options,
		isMulti = false,
		url,
		nonce,
		method = 'post',
		className,
		list_type,
		required,
	} = props;

	const [currentValue, setCurrentValue] = useState(normalizeValues(value));
	const [search, setSearch] = useState('');
	const { fetch, result: currentOptions } = useFetch({ defaultValue: options || [] });

	const timer = useRef(null);

	useEffect(() => {
		window.clearTimeout(timer.current);

		timer.current = window.setTimeout(() => {
			if ((search !== '' || !options) && list_type) {
				const body = {
					id,
					value,
					options,
					isMulti,
					url,
					nonce,
					method,
					className,
					list_type,
					required,
					current_value: currentValue ? currentValue.filter(Boolean) : [],
					search
				};

				fetch({ method, url, nonce, body });
			}
		}, 500);

		return () => {
			window.clearTimeout(timer.current);
		};
	}, [search, url, nonce, id, options, list_type, value, isMulti, method, className, required, currentValue, fetch]);

	useEffect(() => {
		onChange(isMulti ? currentValue : currentValue.find(Boolean));
	}, [onChange, isMulti, value, currentValue]);

	const handleChange = (options) => {
		if (isMulti) {
			setCurrentValue(options ? options.map(option => String(option.value)) : []);
		} else {
			setCurrentValue(options ? [String(options.value)] : []);
		}
	};

	return (
		<ErrorBoundary>
			<SelectControl
				id={id}
				onChange={handleChange}
				value={currentOptions && currentOptions.filter(option => currentValue.includes(String(option.value)))}
				onInputChange={setSearch}
				options={currentOptions && currentOptions.map(o => ({ ...o, value: String(o.value) }))}
				isMulti={isMulti}
				className={className}
				isClearable={!required}
				noOptionsMessage={() => search === '' ? __('Type to search', 'wpify-custom-fields') : undefined}
			/>
		</ErrorBoundary>
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
	className: PT.string,
	list_type: PT.string,
	appContext: PT.object,
};

export default SearchableSelectControl;
