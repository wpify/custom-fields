import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';

const WeekField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="week"
				className={classnames('regular-text code', className)}
			/>
		</ErrorBoundary>
	);
};

WeekField.propTypes = {
	className: PT.string,
};

export default WeekField;
