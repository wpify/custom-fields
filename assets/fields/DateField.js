import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const DateField = (props) => {
	const { className } = props;

	return (
		<InputField
			{...props}
			type="date"
			className={classnames(className)}
		/>
	);
};

DateField.propTypes = {
	className: PT.string,
}

export default DateField;
