import React from 'react';
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

export default HtmlField;
