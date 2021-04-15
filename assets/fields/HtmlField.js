import React from 'react';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const HtmlField = (props) => {
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

HtmlField.propTypes = {
	className: PT.string,
	content: PT.oneOfType([PT.string, PT.element]),
	custom_attributes: PT.object,
};
HtmlField.noSection = true;
HtmlField.noLabel = true;

export default HtmlField;
