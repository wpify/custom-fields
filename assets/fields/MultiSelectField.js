import React from 'react';
import SelectField from './SelectField';

const MultiSelectField = (props) => {
	return (
		<SelectField {...props} isMulti/>
	);
};

export default MultiSelectField;
