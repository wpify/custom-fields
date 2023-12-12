import React from 'react';
import PostField from './PostField';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const MultiPostField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	return (
		<ErrorBoundary>
			<PostField {...props} isMulti />
		</ErrorBoundary>
	);
};

export default MultiPostField;
