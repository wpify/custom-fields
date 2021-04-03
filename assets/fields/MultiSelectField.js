import React from 'react';
import PT from 'prop-types';
import SelectField from './SelectField';

const MultiSelectField = (props) => {
	return (
		<SelectField {...props} isMulti />
	)
};

MultiSelectField.propTypes = {
  isMulti: PT.bool,
};

export default MultiSelectField;
