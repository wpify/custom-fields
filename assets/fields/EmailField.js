import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const UrlField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="email"
				className={classnames('regular-text ltr', className)}
			/>
		</ErrorBoundary>
	);
};

UrlField.propTypes = {
	className: PT.string,
};

export default UrlField;
