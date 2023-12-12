import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const TextField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="text"
				className={classnames('regular-text', className)}
			/>
		</ErrorBoundary>
	);
};

export default TextField;
