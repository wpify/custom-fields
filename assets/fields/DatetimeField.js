import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';
import { dateI18n } from '@wordpress/date';
import { applyFilters } from '@wordpress/hooks';

const DatetimeField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
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

DatetimeField.getHumanTitle = (item, innerValue) => {
	return innerValue ? dateI18n(window.wcf_date.date_format + ' ' + window.wcf_date.time_format, innerValue) : null;
};

export default DatetimeField;
