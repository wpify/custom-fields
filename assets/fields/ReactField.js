import React from 'react';
import PT from 'prop-types';
import { applyFilters } from '@wordpress/hooks';
import ErrorBoundary from '../components/ErrorBoundary';

const ReactField = (props) => {
	const { react_component } = props;

	return react_component
		? (
			<ErrorBoundary>
				{applyFilters(react_component, <React.Fragment/>, props)}
			</ErrorBoundary>
		)
		: null;
};

ReactField.propTypes = {
	className: PT.string,
	react_component: PT.element,
};

export default ReactField;
