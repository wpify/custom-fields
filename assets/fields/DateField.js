import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const DateField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="date"
				className={classnames(className)}
			/>
		</ErrorBoundary>
	);
};

DateField.propTypes = {
	className: PT.string,
}

export default DateField;
