/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const UrlField = (props) => {
	const { className, ...rest } = props;

	return (
		<InputField
			type="url"
			className={classnames('regular-text code', className)}
			{...rest}
		/>
	);
};

export default UrlField;
