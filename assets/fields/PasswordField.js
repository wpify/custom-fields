import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const PasswordField = (props) => {
	const { className } = props;

	return (
		<InputField
			{...props}
			type="password"
			className={classnames('regular-text', className)}
		/>
	);
};

PasswordField.propTypes = {
	className: PT.string,
};

export default PasswordField;
