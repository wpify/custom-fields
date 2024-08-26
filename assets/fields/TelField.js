import React, { useEffect, useRef, useCallback } from 'react';
import classnames from 'classnames';
import intlTelInput from 'intl-tel-input';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNormalizedValue } from '../helpers';
import { applyFilters } from '@wordpress/hooks';

// eslint-disable-next-line react/display-name
const TelField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		suffix,
		custom_attributes = {},
		group_level = 0,
		className,
		appContext,
		initial_country = '',
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const inputRef = useRef();
	const itiRef = useRef();

	useEffect(() => {
		itiRef.current = intlTelInput(inputRef.current, {
			utilsScript: window.wcf_build_url + 'int-tel-input-utils.js',
			initialCountry: initial_country,
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
				id={appContext.hooks.id(htmlId(id))}
				name={group_level === 0 ? appContext.hooks.name(id) : null}
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

export default TelField;
