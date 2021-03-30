/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';

const TelField = (props) => {
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
				type="tel"
				className={classnames('regular-text', className)}
				onChange={handleChange}
			/>
		</React.Fragment>
	);
};

export default TelField;
