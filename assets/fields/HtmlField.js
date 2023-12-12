import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const HtmlField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const { className, content = '', custom_attributes = {} } = props;
	return (
		<ErrorBoundary>
			<div
				className={className}
				{...custom_attributes}
				dangerouslySetInnerHTML={{ __html: content }}
			/>
		</ErrorBoundary>
	);
};

export default HtmlField;
