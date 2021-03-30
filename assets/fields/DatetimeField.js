/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const DatetimeField = (props) => {
	const { id, className, onChange } = props;

	const handleChange = (value) => {
		if (onChange) {
			onChange({ [id]: value });
		}
	};

	return (
		<InputField
			{...props}
			type="datetime-local"
			className={classnames(className)}
			onChange={handleChange}
		/>
	);
};

export default DatetimeField;
