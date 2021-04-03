import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';
import intlTelInput from 'intl-tel-input';

const TelField = (props) => {
	const { className } = props;
	const inputRef = useRef();

	useEffect(() => {
		if (inputRef.current) {
			intlTelInput(inputRef.current, {
				utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.11/js/utils.min.js',
			});
		}
	}, [inputRef.current]);

	return (
		<React.Fragment>
			<InputField
				{...props}
				ref={inputRef}
				type="tel"
				className={classnames('regular-text', className)}
			/>
		</React.Fragment>
	);
};

TelField.propTypes = {
	className: PT.string,
};

export default TelField;
