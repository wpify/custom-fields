/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const UrlField = (props) => {
	const { className, ...rest } = props;

	return (
		<InputField
			className={classnames('regular-text code', className)}
			{...rest}
			type="url"
		/>
	);
};

export default UrlField;
