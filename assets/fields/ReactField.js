import React from 'react';
import PT from 'prop-types';
import { applyFilters } from '@wordpress/hooks';

const ReactField = (props) => {
  const { react_component } = props;

  return react_component
    ? applyFilters(react_component, <React.Fragment />, props)
    : null;
};

ReactField.propTypes = {
  className: PT.string,
};

export default ReactField;
