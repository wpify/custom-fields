import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const TextField = (props) => {
	const { className } = props;

	return (
		<InputField
			{...props}
			type="text"
			className={classnames('regular-text', className)}
		/>
	);
};

TextField.propTypes = {
	className: PT.string,
};

export default TextField;
