import React, { useContext, useEffect, useRef, useState } from 'react';
import PT from 'prop-types';
import Select from 'react-select';
import { __ } from '@wordpress/i18n';
import AppContext from '../components/AppContext';

const SelectField = (props) => {
	const {
		id,
		value,
		onChange,
		label,
		show_option_none,
		options = [],
		description,
		async_list_type = null,
		group_level = 0,
	} = props;

	const { api } = useContext(AppContext);
	const [currentValue, setCurrentValue] = useState(value);
	const [currentOption, setCurrentOption] = useState({});
	const [currentOptions, setCurrentOptions] = useState(options);
	const [currentInput, setCurrentInput] = useState(value);
	const timer = useRef();
	const controller = useRef(new AbortController());

	useEffect(() => {
		setCurrentOption({
			value,
			label: currentOptions?.find(option => String(option.value) === String(currentValue))?.label,
		});
	}, [currentValue, currentOptions]);

	useEffect(() => {
		if (show_option_none) {
			options.unshift({ value: null, label: __('Please select', 'wpify-woo') });
		}
	}, [options]);

	const fetchList = (body) => {
		controller.current.abort();
		controller.current = new AbortController();

		fetch(api.url + '/list', {
			method: 'post',
			signal: controller.current.signal,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-WP-Nonce': api.nonce
			},
			body: JSON.stringify(body),
		}).then(response => {
			if (response.ok) {
				return response.json();
			}
		}).then(options => setCurrentOptions(
			typeof options === 'object' ? Object.values(options) : options
		));
	};

	useEffect(() => {
		if (async_list_type) {
			window.clearTimeout(timer.current);

			timer.current = window.setTimeout(() => {
				fetchList({ id, value, label, show_option_none, search: currentInput || value, list_type: async_list_type });
			}, 500);

			return () => {
				window.clearTimeout(timer.current);
			};
		}
	}, [id, value, label, show_option_none, async_list_type, currentInput]);

	const handleChange = (option) => {
		setCurrentValue(option.value);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={currentValue}/>
			)}
			<Select
				id={id}
				onChange={handleChange}
				value={currentOption}
				onInputChange={setCurrentInput}
				options={currentOptions}
				className="wcf-select"
				styles={{
					control: (styles, { isFocused }) => ({
						...styles,
						minHeight: '30px',
						borderColor: isFocused ? '#2271b1 !important' : '#8c8f94',
						boxShadow: isFocused ? '0 0 0 1px #2271b1' : 'none',
						outline: isFocused ? '2px solid transparent' : 'none',
						borderRadius: '3px',
						maxWidth: '25em',
					}),
					valueContainer: styles => ({
						...styles,
						padding: '0 8px',
					}),
				}}
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
