import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const PasswordField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="password"
				className={classnames('regular-text', className)}
			/>
		</ErrorBoundary>
	);
};

PasswordField.propTypes = {
	className: PT.string,
};

export default PasswordField;
