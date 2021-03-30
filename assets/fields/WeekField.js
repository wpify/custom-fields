/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const WeekField = (props) => {
	const { id, className, onChange } = props;

	const handleChange = (value) => {
		if (onChange) {
			onChange({ [id]: value });
		}
	};

	return (
		<InputField
			{...props}
			type="week"
			className={classnames('regular-text code', className)}
			onChange={handleChange}
		/>
	);
};

export default WeekField;
