import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const NumberField = (props) => {
	const { className, custom_attributes: { max } } = props;

	return (
		<ErrorBoundary>
			<InputField
				{...props}
				type="number"
				className={classnames(className, {
					'small-text': max < 9999 || !max,
				})}
			/>
		</ErrorBoundary>
	);
};

NumberField.propTypes = {
	className: PT.string,
	custom_attributes: PT.object,
};

export default NumberField;
