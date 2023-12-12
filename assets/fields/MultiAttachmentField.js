import React from 'react';
import AttachmentField from './AttachmentField';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const MultiAttachmentField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	return (
		<ErrorBoundary>
			<AttachmentField {...props} isMulti={true}/>
		</ErrorBoundary>
	);
};

export default MultiAttachmentField;
