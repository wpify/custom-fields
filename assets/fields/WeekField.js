import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import InputField from './InputField';

const WeekField = (props) => {
	const { className } = props;

	return (
		<InputField
			{...props}
			type="week"
			className={classnames('regular-text code', className)}
		/>
	);
};

WeekField.propTypes = {
	className: PT.string,
};

export default WeekField;
