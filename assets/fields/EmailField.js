/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const UrlField = (props) => {
	const { className, ...rest } = props;

	return (
		<InputField
			type="email"
			className={classnames('regular-text ltr', className)}
			{...rest}
		/>
	);
};

export default UrlField;
