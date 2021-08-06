import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
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

EmailField.propTypes = {
	className: PT.string,
};

export default EmailField;
