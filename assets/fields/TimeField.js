import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const TimeField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="time"
				className={classnames(className)}
			/>
		</ErrorBoundary>
	);
};

TimeField.propTypes = {
	className: PT.string,
};

export default TimeField;
