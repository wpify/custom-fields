import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const DatetimeField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="datetime-local"
				className={classnames(className)}
			/>
		</ErrorBoundary>
	);
};

DatetimeField.propTypes = {
	className: PT.string,
}

export default DatetimeField;
