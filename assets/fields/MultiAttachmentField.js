import React from 'react';
import AttachmentField from './AttachmentField';
import ErrorBoundary from '../components/ErrorBoundary';

const MultiAttachmentField = (props) => {
  return (
  	<ErrorBoundary>
    	<AttachmentField {...props} isMulti={true} />
		</ErrorBoundary>
  );
};

export default MultiAttachmentField;
