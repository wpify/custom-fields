import React, { useContext, useEffect, useRef, useState } from 'react';
import PT from 'prop-types';
import { __ } from '@wordpress/i18n';
import AppContext from '../components/AppContext';
import SelectControl from '../components/SelectControl';
import { useFetch } from '../helpers';

const normalizeValues = (values) => Array.isArray(values) ? values.map(String) : [String(values)];

const SelectField = (props) => {
	const {
		id,
		value,
		onChange,
		options = [],
		description,
		list_type = null,
		group_level = 0,
		required,
		isMulti = false,
	} = props;

	const { api } = useContext(AppContext);
	const [currentValue, setCurrentValue] = useState(normalizeValues(value));
	const [search, setSearch] = useState(value);
	const timer = useRef();
	const { fetch, result: currentOptions } = useFetch({ defaultValue: [] });

	console.log(currentValue);

	useEffect(() => {
		if (!required) {
			options.unshift({ value: null, label: __('-', 'wpify-woo') });
		}
	}, [options]);

	useEffect(() => {
		if (list_type) {
			window.clearTimeout(timer.current);

			timer.current = window.setTimeout(() => {
				const body = { ...props, search: search };

				fetch({
					method: 'post',
					url: api.url + '/list',
					nonce: api.nonce,
					body,
				});
			}, 500);

			return () => {
				window.clearTimeout(timer.current);
			};
		}
	}, [list_type, search, props, api]);

	const handleChange = (options) => {
		setCurrentValue(isMulti
			? options.map(option => String(option.value))
			: [String(options.value)]
		);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(isMulti ? currentValue : currentValue.find(Boolean));
		}
	}, [value, currentValue]);

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={isMulti ? JSON.stringify(currentValue.filter(Boolean)) : currentValue} />
			)}
			<SelectControl
				id={id}
				onChange={handleChange}
				value={currentOptions.filter(option => currentValue.includes(String(option.value)))}
				onInputChange={setSearch}
				options={currentOptions}
				isMulti={isMulti}
			/>
			{description && (
				<p className="description" dangerouslySetInnerHTML={{ __html: description }}/>
			)}
		</React.Fragment>
	);
};

SelectField.propTypes = {
	className: PT.string,
};

export default SelectField;
