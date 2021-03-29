/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const NumberField = (props) => {
	const { className, max, ...rest } = props;

	return (
		<InputField
			className={classnames(className, {
				'small-text': max < 9999 || !max,
			})}
			{...rest}
			type="number"
		/>
	);
};

export default NumberField;
