import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';
import { dateI18n } from '@wordpress/date';

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

TimeField.getHumanTitle = (item, innerValue) => {
	return innerValue ? dateI18n(window.wcf_date.time_format, innerValue) : null;
};


export default TimeField;
