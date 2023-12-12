import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import ErrorBoundary from '../components/ErrorBoundary';
import { dateI18n } from '@wordpress/date';
import { applyFilters } from '@wordpress/hooks';

const DateField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
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

DateField.getHumanTitle = (item, innerValue) => {
	return innerValue ? dateI18n(window.wcf_date.date_format, innerValue) : null;
};

export default DateField;
