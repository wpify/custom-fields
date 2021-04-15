import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const MonthField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="month"
				className={classnames(className)}
			/>
		</ErrorBoundary>
	);
};

MonthField.propTypes = {
	className: PT.string,
};

export default MonthField;
