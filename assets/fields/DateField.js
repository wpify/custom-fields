/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const DateField = (props) => {
	const { className, ...rest } = props;

	return (
		<InputField
			className={classnames(className)}
			{...rest}
			type="date"
		/>
	);
};

export default DateField;
