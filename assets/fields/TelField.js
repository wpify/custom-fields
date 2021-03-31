import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const TelField = (props) => {
	const { className } = props;

	return (
		<React.Fragment>
			<InputField
				{...props}
				type="tel"
				className={classnames('regular-text', className)}
			/>
		</React.Fragment>
	);
};

TelField.propTypes = {
	className: PT.string,
};

export default TelField;
