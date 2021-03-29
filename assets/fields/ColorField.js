/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const ColorField = (props) => {
	const { className, ...rest } = props;

	return (
		<React.Fragment>
			<InputField
				className={classnames('colorpick', className)}
				{...rest}
				type="color"
			/>
		</React.Fragment>
	);
};

export default ColorField;
