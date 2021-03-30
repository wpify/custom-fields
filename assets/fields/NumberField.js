/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const NumberField = (props) => {
	const { id, className, max, onChange } = props;

	const handleChange = (value) => {
		if (onChange) {
			onChange({ [id]: value });
		}
	};

	return (
		<InputField
			{...props}
			type="number"
			className={classnames(className, {
				'small-text': max < 9999 || !max,
			})}
			onChange={handleChange}
		/>
	);
};

export default NumberField;
