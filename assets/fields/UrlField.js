import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const UrlField = (props) => {
	const { className } = props;

	return (
		<InputField
			{...props}
			type="url"
			className={classnames('regular-text code', className)}
		/>
	);
};

UrlField.propTypes = {
	className: PT.string,
};

export default UrlField;
