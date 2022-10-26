import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';

const HiddenField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="hidden"
				className={classnames(className)}
			/>
		</ErrorBoundary>
	);
};

export default HiddenField;
