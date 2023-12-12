import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const NumberField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const { className, custom_attributes: { max } } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="number"
				className={classnames(className, {
					'small-text': max < 9999 || !max,
				})}
			/>
		</ErrorBoundary>
	);
};

export default NumberField;
