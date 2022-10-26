import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
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

export default PasswordField;
