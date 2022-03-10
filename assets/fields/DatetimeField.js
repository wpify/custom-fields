import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';
import { dateI18n } from '@wordpress/date';

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

DatetimeField.getHumanTitle = (item, innerValue) => {
	return innerValue ? dateI18n(window.wcf_date.date_format + ' ' + window.wcf_date.time_format, innerValue) : null;
};

export default DatetimeField;
