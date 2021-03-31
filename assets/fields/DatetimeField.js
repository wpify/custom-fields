import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const DatetimeField = (props) => {
	const { className } = props;

	return (
		<InputField
			{...props}
			type="datetime-local"
			className={classnames(className)}
		/>
	);
};

DatetimeField.propTypes = {
	className: PT.string,
}

export default DatetimeField;
