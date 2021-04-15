import React from 'react';
import SelectField from './SelectField';
import ErrorBoundary from '../components/ErrorBoundary';

const MultiSelectField = (props) => {
	return (
		<ErrorBoundary>
			<SelectField {...props} isMulti />
		</ErrorBoundary>
	);
};

export default MultiSelectField;
