import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const EmailField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
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
