import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const UrlField = (props) => {
	const { className } = props;

	return (
		<InputField
			{...props}
			type="email"
			className={classnames('regular-text ltr', className)}
		/>
	);
};

UrlField.propTypes = {
	className: PT.string,
};

export default UrlField;
