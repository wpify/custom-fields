import React from 'react';
import AttachmentField from './AttachmentField';

const MultiAttachmentField = (props) => {
  return (
    <AttachmentField {...props} isMulti={true} />
  );
};

export default MultiAttachmentField;
