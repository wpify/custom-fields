import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';

const UrlField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="url"
				className={classnames('regular-text code', className)}
			/>
		</ErrorBoundary>
	);
};

export default UrlField;
