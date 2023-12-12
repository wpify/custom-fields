import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const HiddenField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
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
