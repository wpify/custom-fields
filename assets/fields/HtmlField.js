import React from 'react';
import PT from 'prop-types';

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

HtmlField.propTypes = {
	className: PT.string,
	content: PT.oneOfType([PT.string, PT.element]),
	custom_attributes: PT.object,
};
HtmlField.noSection = true;
HtmlField.noLabel = true;

export default HtmlField;
