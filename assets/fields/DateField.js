import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';
import { dateI18n } from '@wordpress/date';

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
};

DateField.getHumanTitle = (item, innerValue) => {
	return innerValue ? dateI18n(window.wcf_date.date_format, innerValue) : null;
};

export default DateField;
