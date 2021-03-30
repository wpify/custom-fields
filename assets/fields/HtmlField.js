/* eslint-disable react/prop-types */

import React from 'react';

const HtmlField = (props) => {
	const { className, content = '', custom_attributes = {} } = props;

	return (
		<div
			className={className}
			{...custom_attributes}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
};

HtmlField.noSection = true;
HtmlField.noLabel = true;

export default HtmlField;
