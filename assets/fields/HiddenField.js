import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const HiddenField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="hidden"
				className={classnames(className)}
			/>
		</ErrorBoundary>
	);
};

HiddenField.propTypes = {
	className: PT.string,
};

export default HiddenField;
