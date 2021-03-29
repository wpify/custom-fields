/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const TextField = (props) => {
	const { className, ...rest } = props;

	return (
		<InputField
			className={classnames('regular-text', className)}
			{...rest}
			type="text"
		/>
	);
};

export default TextField;
