import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';

const EmailField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="email"
				className={classnames('regular-text ltr', className)}
			/>
		</ErrorBoundary>
	);
};

export default EmailField;
