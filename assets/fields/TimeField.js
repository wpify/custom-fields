/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const TimeField = (props) => {
	const { id, className, onChange } = props;

	const handleChange = (value) => {
		if (onChange) {
			onChange({ [id]: value });
		}
	};

	return (
		<InputField
			{...props}
			type="time"
			className={classnames(className)}
			onChange={handleChange}
		/>
	);
};

export default TimeField;
