/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const PasswordField = (props) => {
	const { className, ...rest } = props;

	return (
		<InputField
			className={classnames('regular-text', className)}
			{...rest}
			type="password"
		/>
	);
};

export default PasswordField;
