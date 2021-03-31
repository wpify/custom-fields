import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const TimeField = (props) => {
	const { className } = props;

	return (
		<InputField
			{...props}
			type="time"
			className={classnames(className)}
		/>
	);
};

TimeField.propTypes = {
	className: PT.string,
};

export default TimeField;
