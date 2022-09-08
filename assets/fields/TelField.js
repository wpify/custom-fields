import React, { useEffect, useRef, useCallback } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import intlTelInput from 'intl-tel-input';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNormalizedValue } from '../helpers';

// eslint-disable-next-line react/display-name
const TelField = (props) => {
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		suffix,
		custom_attributes = {},
		group_level = 0,
		className,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const inputRef = useRef();
	const itiRef = useRef();

	useEffect(() => {
		itiRef.current = intlTelInput(inputRef.current, {
			nationalMode: false,
			utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.11/js/utils.min.js',
		});
	}, []);

	const handleChange = useCallback((event) => {
		setCurrentValue(itiRef.current.getNumber());
	}, [setCurrentValue]);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<input
				id={htmlId(id)}
				name={group_level === 0 ? id : null}
				value={currentValue}
				aria-describedby={describedBy}
				className={classnames(className, 'regular-text components-text-control__input')}
				ref={inputRef}
				type="tel"
				onChange={handleChange}
				{...custom_attributes}
			/>
			{suffix && ' ' + suffix}
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

TelField.propTypes = {
	id: PT.string,
	htmlId: PT.func,
	value: PT.string,
	onChange: PT.func,
	description: PT.oneOfType([PT.string, PT.element]),
	suffix: PT.oneOfType([PT.string, PT.element]),
	custom_attributes: PT.oneOfType([PT.object, PT.array]),
	group_level: PT.number,
	className: PT.string,
	generator: PT.string,
};

export default TelField;
