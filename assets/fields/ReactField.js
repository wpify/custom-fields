import React from 'react';
import { applyFilters } from '@wordpress/hooks';
import ErrorBoundary from '../components/ErrorBoundary';

const ReactField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const { react_component } = props;

	return react_component
		? (
			<ErrorBoundary>
				{applyFilters(react_component, <div />, props)}
			</ErrorBoundary>
		)
		: null;
};

export default ReactField;
