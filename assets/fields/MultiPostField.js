import React from 'react';
import PostField from './PostField';
import ErrorBoundary from '../components/ErrorBoundary';

const MultiPostField = (props) => {
	return (
		<ErrorBoundary>
			<PostField {...props} isMulti />
		</ErrorBoundary>
	);
};

export default MultiPostField;
