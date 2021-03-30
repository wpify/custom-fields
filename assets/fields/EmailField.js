/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const UrlField = (props) => {
	const { id, className, onChange } = props;

	const handleChange = (value) => {
		if (onChange) {
			onChange({ [id]: value });
		}
	};

	return (
		<InputField
			{...props}
			type="email"
			className={classnames('regular-text ltr', className)}
			onChange={handleChange}
		/>
	);
};

export default UrlField;
