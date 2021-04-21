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

MultiSelectField.getHumanTitle = (item, value) => {
	if (Array.isArray(item.options) && Array.isArray(value)) {
		const options = item.options.filter(i => value.includes(i.value));
		return options.map(o => o.label).join(', ');
	}

	return value;
};


export default MultiSelectField;
