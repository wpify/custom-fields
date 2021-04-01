import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import PT from 'prop-types';
import Select from 'react-select';
import { __ } from '@wordpress/i18n';

const SelectField = (props) => {
	const {
		id,
		value = [],
		onChange,
		show_option_none,
		options = [],
		description,
		group_level = 0,
	} = props;

	const [currentValues, setCurrentValues] = useState(Array.isArray(value) ? value : []);
	const [currentOptions, setCurrentOptions] = useState({});

	useEffect(() => {
		setCurrentOptions(options
			.filter(option => currentValues.map(v => String(v)).includes(String(option.value)))
			.map((option) => ({
				value: option.value,
				label: option.label,
			}))
		);
	}, [currentValues, options]);

	useEffect(() => {
		if (show_option_none) {
			options.unshift({ value: null, label: __('Please select', 'wpify-woo') });
		}
	}, [options]);

	const handleChange = useCallback((options) => {
		const values = options.map(option => option.value);
		setCurrentValues(values);
		setCurrentOptions(options);

		if (onChange) {
			onChange({ [id]: values });
		}
	}, [id]);

  return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={JSON.stringify(currentValues)}/>
			)}
			<Select
				isMulti={true}
				id={id}
				onChange={handleChange}
				value={currentOptions}
				options={options}
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
				<p className="description" dangerouslySetInnerHTML={{ __html: description }} />
			)}
		</React.Fragment>
  );
};

SelectField.propTypes = {
  className: PT.string,
};

export default SelectField;
