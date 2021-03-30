/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const ColorField = (props) => {
	const { id, className, onChange } = props;

	const handleChange = (value) => {
		if (onChange) {
			onChange({ [id]: value });
		}
	};

	return (
		<React.Fragment>
			<InputField
				{...props}
				type="color"
				className={classnames('colorpick', className)}
				onChange={handleChange}
			/>
		</React.Fragment>
	);
};

export default ColorField;
