import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const MonthField = (props) => {
	const { className } = props;

	return (
		<InputField
			{...props}
			type="month"
			className={classnames(className)}
		/>
	);
};

MonthField.propTypes = {
	className: PT.string,
};

export default MonthField;
