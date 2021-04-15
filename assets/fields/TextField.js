import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const TextField = (props) => {
	const { className } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="text"
				className={classnames('regular-text', className)}
			/>
		</ErrorBoundary>
	);
};

TextField.propTypes = {
	className: PT.string,
};

export default TextField;
