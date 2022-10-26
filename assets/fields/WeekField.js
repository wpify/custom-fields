import React from 'react';
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

export default WeekField;
