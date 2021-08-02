import React, { useContext, useEffect, useState } from 'react';
import PT from 'prop-types';
import { __ } from '@wordpress/i18n';
import AppContext from './AppContext';
import { useDelay, useFetch } from '../helpers';
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

	const { api } = useContext(AppContext);
	const [currentValue, setCurrentValue] = useState(normalizeValues(value));
	const [search, setSearch] = useState('');
	const { fetch, result: currentOptions } = useFetch({ defaultValue: options || [] });

	useDelay(() => {
		if ((search !== '' || !options) && list_type) {
			const body = { ...props, current_value: currentValue ? (currentValue.filter(Boolean) || []) : [], search };

			fetch({ method, url, nonce, body });
		}
	}, [options, search, props, api, currentValue, list_type]);



	useEffect(() => {
		onChange(isMulti ? currentValue : currentValue.find(Boolean));
	}, [onChange, isMulti, value, currentValue]);

	const handleChange = (options) => {
		setCurrentValue(isMulti
			? (options ? options.map(option => String(option.value)) : [])
			: (options ? [String(options.value)] : [])
		);
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
				noOptionsMessage={() => search === '' ? __('Type to search', 'wpify-custom-fields') : undefined}
			/>
			{!required && Boolean(currentValue.length) && !isMulti && (
				<Button
					className={classnames('wcf-button wcf-button--icon')}
					style={{ marginLeft: '10px' }}
					onClick={() => handleChange(isMulti ? [] : null)}
				>
					<svg viewBox="0 0 20 20" width="20" height="20">
						<line stroke="currentColor" x1="3" y1="3" x2="17" y2="17" />
						<line stroke="currentColor" x1="3" y1="17" x2="17" y2="3" />
					</svg>
				</Button>
			)}
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
};

export default SearchableSelectControl;
